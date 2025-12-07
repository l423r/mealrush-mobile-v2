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
  AnalyticsInsight,
} from '../types/analytics.types';

// Centralized analytics state. Does not depend on a specific RootStore to
// allow gradual integration. A reference can be added later if needed.
export class AnalyticsStore {
  period: AnalyticsPeriod = 'day';
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

  get insights(): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    if (!this.trend || this.trend.length === 0) return insights;

    // 1. Goal Adherence Streak (last 3 days)
    // Assuming target calories is passed or we use a default. 
    // Ideally, we should access ProfileStore, but to keep it decoupled, 
    // we'll rely on trend data patterns or pass target as argument if needed.
    // For now, let's look for consistency.

    const sortedTrend = [...this.trend].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const last3Days = sortedTrend.slice(0, 3);

    if (last3Days.length >= 3) {
      // Check if calories are relatively stable (within 20% variance)
      const avg = last3Days.reduce((sum, d) => sum + d.calories, 0) / 3;
      const isStable = last3Days.every(d => Math.abs(d.calories - avg) / avg < 0.2);

      if (isStable) {
        insights.push({
          id: 'stability',
          type: 'success',
          title: 'Стабильность',
          message: 'Последние 3 дня вы держите стабильный уровень калорий. Так держать!',
        });
      }
    }

    // 2. Macro Balance Warning
    if (this.distribution?.macroShare) {
      const { proteinPct, fatPct, carbsPct } = this.distribution.macroShare;
      if (proteinPct < 0.15) {
        insights.push({
          id: 'low_protein',
          type: 'warning',
          title: 'Мало белка',
          message: 'Доля белка в рационе ниже 15%. Попробуйте добавить больше мяса, рыбы или бобовых.',
        });
      }
      if (fatPct > 0.4) {
        insights.push({
          id: 'high_fat',
          type: 'info',
          title: 'Много жиров',
          message: 'Жиры составляют более 40% рациона. Обратите внимание на источники жиров.',
        });
      }
    }

    // 3. Weekend Spikes
    const weekendDays = this.trend.filter(d => {
      const day = new Date(d.date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    const weekDays = this.trend.filter(d => {
      const day = new Date(d.date).getDay();
      return day !== 0 && day !== 6;
    });

    if (weekendDays.length > 0 && weekDays.length > 0) {
      const avgWeekend = weekendDays.reduce((sum, d) => sum + d.calories, 0) / weekendDays.length;
      const avgWeek = weekDays.reduce((sum, d) => sum + d.calories, 0) / weekDays.length;

      if (avgWeekend > avgWeek * 1.2) {
        insights.push({
          id: 'weekend_spike',
          type: 'info',
          title: 'Выходные',
          message: 'В выходные вы потребляете на 20% больше калорий, чем в будни.',
        });
      }
    }

    // 4. Late Dinner Warning
    if (this.distribution?.byMealType) {
      const lateSupper = this.distribution.byMealType.find(m => m.mealType === 'LATE_SUPPER');
      const totalCalories = this.summaryKpi?.totalCalories || 1; // avoid division by zero

      if (lateSupper && (lateSupper.calories / totalCalories) > 0.15) {
        insights.push({
          id: 'late_dinner',
          type: 'warning',
          title: 'Поздний ужин',
          message: 'Более 15% калорий приходится на поздний ужин. Старайтесь есть меньше перед сном.',
        });
      }
    }

    // 5. Carb Heavy
    if (this.distribution?.macroShare?.carbsPct > 0.6) {
      insights.push({
        id: 'high_carbs',
        type: 'info',
        title: 'Много углеводов',
        message: 'Углеводы составляют более 60% рациона. Следите за сахаром.',
      });
    }

    return insights;
  }
}

export default AnalyticsStore;
