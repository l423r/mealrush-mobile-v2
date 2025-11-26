import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  AnalyticsAggregatePayload,
  AnalyticsPeriod,
  DistributionData,
  MacroShare,
  SummaryKpi,
  TopProductItem,
  TrendPoint,
} from '../../types/analytics.types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type DateRange = { startDate: string; endDate: string };

function toIso(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function resolveRange(period: AnalyticsPeriod): DateRange {
  const today = new Date();
  if (typeof period === 'string') {
    switch (period) {
      case 'day': {
        const d = toIso(today);
        return { startDate: d, endDate: d };
      }
      case 'week': {
        // Use user's local timezone and ISO calendar week starting Monday
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const end = endOfWeek(today, { weekStartsOn: 1 });
        return { startDate: toIso(start), endDate: toIso(end) };
      }
      case 'month': {
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        return { startDate: toIso(start), endDate: toIso(end) };
      }
    }
  }
  return { startDate: period.from, endDate: period.to };
}

async function fetchTrend(period: AnalyticsPeriod): Promise<TrendPoint[]> {
  const { startDate, endDate } = resolveRange(period);
  // Fetch all metrics to build a combined series so UI can switch locally
  // API expects: CALORIES, PROTEINS, FATS, CARBOHYDRATES (plural forms)
  const metrics: Array<{ api: string; field: Exclude<keyof TrendPoint, 'date'> }> = [
    { api: 'CALORIES', field: 'calories' },
    { api: 'PROTEINS', field: 'protein' },
    { api: 'FATS', field: 'fat' },
    { api: 'CARBOHYDRATES', field: 'carbs' },
  ];
  const requests = metrics.map((m) =>
    apiClient
      .get<any>(ApiRoutes.Nutrition.Trend, {
        params: { startDate, endDate, metric: m.api },
      })
      .then((res) => ({ field: m.field, data: res.data }))
      .catch((err) => {
        // If a metric fails, log and return empty data for that metric
        if (__DEV__) {
          console.warn(`[AnalyticsTrend] Failed to fetch ${m.api}:`, err);
        }
        return { field: m.field, data: { dailyValues: [] } };
      })
  );

  const results = await Promise.all(requests);

  // Merge by date
  const byDate: Record<string, TrendPoint> = {};
  for (const r of results) {
    const arr: Array<{ date: string; value: number }> = Array.isArray(r.data)
      ? (r.data as any)
      : r.data?.dailyValues || [];
    for (const p of arr) {
      const existing = byDate[p.date] || {
        date: p.date,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      };
      existing[r.field] = p.value ?? 0;
      byDate[p.date] = existing;
    }
  }
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

export const analyticsService = {
  async getAggregates(
    period: AnalyticsPeriod
  ): Promise<AnalyticsAggregatePayload> {
    const { startDate, endDate } = resolveRange(period);

    // Fetch Statistics (contains summary, distribution, and top products) and Trend in parallel
    const [statsResponse, trend] = await Promise.all([
      apiClient.get<any>(ApiRoutes.Nutrition.Statistics, {
        params: { startDate, endDate },
      }),
      fetchTrend(period),
    ]);

    const data = statsResponse.data;

    if (__DEV__) {
      console.log('[Analytics] Statistics response:', data);
    }

    // 1. Map Summary
    const totalCalories = (data?.averageCalories || 0) * (data?.totalDays || 0);
    const summary: SummaryKpi = {
      totalCalories,
      averageDailyCalories: data?.averageCalories || 0,
      protein: data?.averageProteins || 0,
      fat: data?.averageFats || 0,
      carbs: data?.averageCarbohydrates || 0,
      mealsCount: data?.totalMeals || 0,
      daysCount: data?.totalDays || 0,
    };

    // 2. Map Distribution
    let macro: MacroShare | undefined = data?.macroShare;
    if (!macro) {
      const avgP: number = data?.averageProteins ?? 0;
      const avgF: number = data?.averageFats ?? 0;
      const avgC: number = data?.averageCarbohydrates ?? 0;
      const kcalFromP = avgP * 4;
      const kcalFromF = avgF * 9;
      const kcalFromC = avgC * 4;
      const total = kcalFromP + kcalFromF + kcalFromC;
      macro = total > 0
        ? {
          proteinPct: kcalFromP / total,
          fatPct: kcalFromF / total,
          carbsPct: kcalFromC / total,
        }
        : { proteinPct: 0, fatPct: 0, carbsPct: 0 };
    }
    const distribution: DistributionData = {
      macroShare: macro,
      byMealType: data?.byMealType || []
    };

    // 3. Map Top Products
    // API returns: { productId: number, productName: string, usageCount: number }
    const rawTopProducts = data?.topProducts || [];
    const topProducts: TopProductItem[] = rawTopProducts.map((item: any) => ({
      id: String(item.productId),
      name: item.productName,
      calories: 0, // API doesn't return calories for top products list yet
      usageCount: item.usageCount,
    }));

    return {
      summary,
      trend,
      distribution,
      topProducts,
    };
  },
};

export type AnalyticsService = typeof analyticsService;
