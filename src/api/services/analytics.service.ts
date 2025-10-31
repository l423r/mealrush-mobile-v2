import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
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
  const { data } = await apiClient.get<any>(MY_FOOD_ENDPOINTS.NUTRITION_TREND, {
    params: { startDate, endDate, metric: 'CALORIES' },
  });
  if (__DEV__) {
    console.log('[AnalyticsTrend] range:', { startDate, endDate, metric: 'CALORIES' });
    console.log('[AnalyticsTrend] response:', data);
  }
  // The backend may return either an array of points or an object
  // with a dailyValues field. Normalize to TrendPoint[] with calories filled.
  if (Array.isArray(data)) {
    return data as TrendPoint[];
  }
  const dailyValues: Array<{ date: string; value: number }> = data?.dailyValues || [];
  return dailyValues.map((p) => ({
    date: p.date,
    calories: p.value ?? 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  }));
}

async function fetchStatistics(period: AnalyticsPeriod): Promise<SummaryKpi> {
  const { startDate, endDate } = resolveRange(period);
  const { data } = await apiClient.get<any>(MY_FOOD_ENDPOINTS.NUTRITION_STATISTICS, {
    params: { startDate, endDate },
  });
  if (__DEV__) {
    console.log('[AnalyticsStatistics] range:', { startDate, endDate });
    console.log('[AnalyticsStatistics] response:', data);
  }
  // Map backend statistics payload to SummaryKpi used by UI
  const totalCalories = (data?.averageCalories || 0) * (data?.totalDays || 0);
  const mapped: SummaryKpi = {
    totalCalories,
    averageDailyCalories: data?.averageCalories || 0,
    protein: data?.averageProteins || 0,
    fat: data?.averageFats || 0,
    carbs: data?.averageCarbohydrates || 0,
    mealsCount: data?.totalMeals || 0,
    daysCount: data?.totalDays || 0,
  };
  return mapped;
}

async function fetchDistribution(
  period: AnalyticsPeriod
): Promise<DistributionData> {
  // Some backends return macro share and by-meal in one call (STATISTICS),
  // others expose a dedicated endpoint. We'll try STATISTICS first.
  const { startDate, endDate } = resolveRange(period);
  const { data } = await apiClient.get<any>(MY_FOOD_ENDPOINTS.NUTRITION_STATISTICS, {
    params: { startDate, endDate },
  });
  if (__DEV__) {
    console.log('[AnalyticsDistribution] range:', { startDate, endDate });
    console.log('[AnalyticsDistribution] response:', data);
  }

  // Attempt to map common shapes; if not provided, derive macro share
  // from average grams using kcal factors (P=4, C=4, F=9)
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

  const byMealType = data?.byMealType || [];
  return { macroShare: macro, byMealType };
}

async function fetchTopProducts(
  period: AnalyticsPeriod
): Promise<TopProductItem[]> {
  // If there is a specific recommendations endpoint, use it; otherwise return empty.
  try {
    const { data } = await apiClient.get<TopProductItem[]>(MY_FOOD_ENDPOINTS.RECOMMENDATIONS_PRODUCTS, {
      params: { page: 0, size: 10 },
    });
    if (__DEV__) {
      console.log('[AnalyticsTopProducts] params:', { page: 0, size: 10 });
      console.log('[AnalyticsTopProducts] response:', data);
    }
    return data;
  } catch {
    return [];
  }
}

export const analyticsService = {
  async getAggregates(
    period: AnalyticsPeriod
  ): Promise<AnalyticsAggregatePayload> {
    const [summary, trend, distribution, topProducts] = await Promise.all([
      fetchStatistics(period),
      fetchTrend(period),
      fetchDistribution(period),
      fetchTopProducts(period),
    ]);

    return {
      summary,
      trend,
      distribution,
      topProducts,
    };
  },
};

export type AnalyticsService = typeof analyticsService;
