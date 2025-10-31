import { makeAutoObservable, runInAction } from 'mobx';
import { analyticsService } from '../api/services/analytics.service';
import type {
  AnalyticsAggregatePayload,
  AnalyticsPeriod,
  AnalyticsServiceFacade,
  DistributionData,
  SummaryKpi,
  TopProductItem,
  TrendMetric,
  TrendPoint,
} from '../types/analytics.types';

// Centralized analytics state. Does not depend on a specific RootStore to
// allow gradual integration. A reference can be added later if needed.
export class AnalyticsStore {
  period: AnalyticsPeriod = 'week';
  loading: boolean = false;
  error: string | null = null;

  // Aggregated data for the currently selected period
  summaryKpi: SummaryKpi | null = null;
  trend: TrendPoint[] = [];
  distribution: DistributionData | null = null;
  topProducts: TopProductItem[] = [];

  // Optional service is injected for easier testing and decoupling
  private readonly service?: AnalyticsServiceFacade;

  // Cache aggregates by simple string key derived from period
  private aggregatesCache: Record<string, AnalyticsAggregatePayload> = {};

  constructor(service?: AnalyticsServiceFacade) {
    this.service =
      service ?? (analyticsService as unknown as AnalyticsServiceFacade);
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setPeriod(next: AnalyticsPeriod) {
    this.period = next;
  }

  async fetchAllForPeriod(force: boolean = false) {
    const key = this.getPeriodKey(this.period);
    if (!force && this.aggregatesCache[key]) {
      const cached = this.aggregatesCache[key];
      runInAction(() => this.applyAggregates(cached));
      return;
    }

    if (!this.service) {
      // Service is not yet wired – keep silent failure with clear message
      this.error = 'Сервис аналитики не подключён';
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      const payload = await this.service.getAggregates(this.period);
      runInAction(() => {
        this.aggregatesCache[key] = payload;
        this.applyAggregates(payload);
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          err?.response?.data?.message || 'Не удалось загрузить аналитику';
      });
    }
  }

  reset() {
    this.loading = false;
    this.error = null;
    this.summaryKpi = null;
    this.trend = [];
    this.distribution = null;
    this.topProducts = [];
  }

  // Selectors / computed helpers
  getTrendSeries(metric: TrendMetric): { x: string; y: number }[] {
    if (!Array.isArray(this.trend) || this.trend.length === 0) {
      return [];
    }
    return this.trend.map((p) => ({
      x: p.date,
      y:
        metric === 'calories'
          ? p.calories
          : metric === 'protein'
            ? p.protein
            : metric === 'fat'
              ? p.fat
              : p.carbs,
    }));
  }

  getMacroShare() {
    return (
      this.distribution?.macroShare || { proteinPct: 0, fatPct: 0, carbsPct: 0 }
    );
  }

  private applyAggregates(payload: AnalyticsAggregatePayload) {
    this.summaryKpi = payload.summary;
    this.trend = payload.trend;
    this.distribution = payload.distribution;
    this.topProducts = payload.topProducts;
  }

  private getPeriodKey(period: AnalyticsPeriod): string {
    if (typeof period === 'string') return period;
    return `from:${period.from}|to:${period.to}`;
  }
}

export default AnalyticsStore;
