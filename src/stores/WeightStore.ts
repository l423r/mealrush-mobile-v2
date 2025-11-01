import { makeAutoObservable, runInAction } from 'mobx';
import type RootStore from './RootStore';
import { weightService } from '../api/services/weight.service';
import type {
  WeightEntry,
  WeightEntryCreate,
  WeightStats,
} from '../types/api.types';

class WeightStore {
  rootStore: RootStore;
  history: WeightEntry[] = [];
  stats: WeightStats | null = null;
  latest: WeightEntry | null = null;
  loading: boolean = false;
  error: string | null = null;

  // Pagination state
  currentPage: number = 0;
  hasMore: boolean = true;
  totalElements: number = 0;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Add new weight entry
  async addEntry(data: WeightEntryCreate) {
    this.loading = true;
    this.error = null;
    try {
      const response = await weightService.addWeight(data);
      runInAction(() => {
        // Add to beginning of history
        this.history.unshift(response.data);
        this.latest = response.data;
        this.loading = false;

        // Refresh profile as backend updates weight automatically
        this.rootStore.profileStore.getProfile();
      });
      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Не удалось записать вес';
      });
      throw error;
    }
  }

  // Fetch weight history with pagination
  async fetchHistory(page: number = 0, size: number = 20, refresh = false) {
    this.loading = true;
    this.error = null;
    try {
      const response = await weightService.getHistory(page, size);
      runInAction(() => {
        if (refresh || page === 0) {
          this.history = response.data.content;
        } else {
          this.history = [...this.history, ...response.data.content];
        }
        this.currentPage = response.data.page;
        this.hasMore = !response.data.last;
        this.totalElements = response.data.totalElements;
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Не удалось загрузить историю';
      });
    }
  }

  // Load more entries (pagination)
  async loadMore(size: number = 20) {
    if (!this.hasMore || this.loading) return;
    await this.fetchHistory(this.currentPage + 1, size, false);
  }

  // Fetch latest weight entry
  async fetchLatest() {
    try {
      const response = await weightService.getLatest();
      runInAction(() => {
        this.latest = response.data;
      });
      return response.data;
    } catch (error: any) {
      // 404 is acceptable if no entries exist yet
      if (error.response?.status !== 404) {
        runInAction(() => {
          this.error =
            error.response?.data?.message || 'Не удалось загрузить вес';
        });
      }
      return null;
    }
  }

  // Fetch weight statistics for a period
  async fetchStats(days: number = 30) {
    try {
      const response = await weightService.getStats(days);
      runInAction(() => {
        this.stats = response.data;
      });
      return response.data;
    } catch (error: any) {
      runInAction(() => {
        this.error =
          error.response?.data?.message || 'Не удалось загрузить статистику';
      });
      return null;
    }
  }

  // Refresh all data
  async refreshAll(days: number = 30) {
    this.loading = true;
    await Promise.all([
      this.fetchHistory(0, 20, true),
      this.fetchStats(days),
      this.fetchLatest(),
    ]);
    runInAction(() => {
      this.loading = false;
    });
  }

  // Delete weight entry
  async deleteEntry(id: number) {
    this.loading = true;
    this.error = null;
    try {
      await weightService.deleteWeight(id);
      
      runInAction(() => {
        // Remove from history
        this.history = this.history.filter((entry) => entry.id !== id);
        
        // Update latest if needed
        if (this.latest?.id === id) {
          this.latest = this.history.length > 0 ? this.history[0] : null;
        }
        
        this.loading = false;
      });

      // Refresh profile and stats after deletion
      await Promise.all([
        this.rootStore.profileStore.getProfile(),
        this.fetchLatest(),
        this.fetchStats(30),
      ]);
      
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Не удалось удалить запись';
      });
      throw error;
    }
  }

  // Get weekly weight change from last 7 days
  get weeklyChange(): number | null {
    if (this.history.length < 2) return null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentEntries = this.history.filter(
      (entry) => new Date(entry.recordedAt) >= weekAgo
    );

    if (recentEntries.length < 2) return null;

    const latest = recentEntries[0];
    const oldest = recentEntries[recentEntries.length - 1];

    return latest.weight - oldest.weight;
  }

  // Reset store state
  reset() {
    this.history = [];
    this.stats = null;
    this.latest = null;
    this.loading = false;
    this.error = null;
    this.currentPage = 0;
    this.hasMore = true;
    this.totalElements = 0;
  }
}

export default WeightStore;

