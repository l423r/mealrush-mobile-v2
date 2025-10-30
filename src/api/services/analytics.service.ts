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

function periodToQuery(period: AnalyticsPeriod): Record<string, string> {
  if (typeof period === 'string') {
    return { period };
  }
  return { from: period.from, to: period.to };
}

async function fetchTrend(period: AnalyticsPeriod): Promise<TrendPoint[]> {
  const { data } = await apiClient.get<TrendPoint[]>(
    MY_FOOD_ENDPOINTS.NUTRITION_TREND,
    {
      params: periodToQuery(period),
    }
  );
  return data;
}

async function fetchStatistics(period: AnalyticsPeriod): Promise<SummaryKpi> {
  const { data } = await apiClient.get<SummaryKpi>(
    MY_FOOD_ENDPOINTS.NUTRITION_STATISTICS,
    {
      params: periodToQuery(period),
    }
  );
  return data;
}

async function fetchDistribution(
  period: AnalyticsPeriod
): Promise<DistributionData> {
  // Some backends return macro share and by-meal in one call (STATISTICS),
  // others expose a dedicated endpoint. We'll try STATISTICS first.
  const { data } = await apiClient.get<any>(
    MY_FOOD_ENDPOINTS.NUTRITION_STATISTICS,
    {
      params: periodToQuery(period),
    }
  );

  // Attempt to map common shapes; fallback to zeros if absent
  const macro: MacroShare = data?.macroShare || {
    proteinPct: 0,
    fatPct: 0,
    carbsPct: 0,
  };

  const byMealType = data?.byMealType || [];
  return { macroShare: macro, byMealType };
}

async function fetchTopProducts(
  period: AnalyticsPeriod
): Promise<TopProductItem[]> {
  // If there is a specific recommendations endpoint, use it; otherwise return empty.
  try {
    const { data } = await apiClient.get<TopProductItem[]>(
      MY_FOOD_ENDPOINTS.RECOMMENDATIONS_PRODUCTS,
      {
        params: periodToQuery(period),
      }
    );
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
