import { makeAutoObservable, runInAction } from 'mobx';
import { accountService } from '../api/services/account.service';
import type RootStore from './RootStore';
import type { AccountResponse, DeleteAccountRequest } from '../types/api.types';

class AccountStore {
  rootStore: RootStore;

  // State
  account: AccountResponse | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Actions
  async getAccountInfo() {
    this.loading = true;
    this.error = null;

    try {
      const response = await accountService.getAccountInfo();

      runInAction(() => {
        this.account = response.data;
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка загрузки информации об аккаунте';
      });
      throw error;
    }
  }

  async deleteAccount(confirmation: boolean) {
    this.loading = true;
    this.error = null;

    try {
      const request: DeleteAccountRequest = { confirmation };
      await accountService.deleteAccount(request);

      runInAction(() => {
        this.loading = false;
        this.error = null;
        this.account = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка удаления аккаунта';
      });
      throw error;
    }
  }

  // Reset store
  reset() {
    this.account = null;
    this.loading = false;
    this.error = null;
  }
}

export default AccountStore;
