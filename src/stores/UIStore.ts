import { makeAutoObservable, runInAction } from 'mobx';
import { Appearance } from 'react-native';
import { makePersistable } from 'mobx-persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type RootStore from './RootStore';

class UIStore {
  rootStore: RootStore;

  // State
  isDark: boolean = true; // Default to dark
  loading: boolean = false;
  error: string | null = null;
  snackbar: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } = {
      visible: false,
      message: '',
      type: 'info',
    };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    // Setup persistence for theme
    makePersistable(this, {
      name: 'UIStore',
      properties: ['isDark'],
      storage: AsyncStorage,
    });

    // Listen to system theme changes (but only if user hasn't set preference)
    this.initializeTheme();
  }

  // Actions
  initializeTheme() {
    // Only set from system preference on first launch
    // After that, use persisted value
    const colorScheme = Appearance.getColorScheme();

    // Listen for theme changes (optional - can be disabled if you want manual control only)
    Appearance.addChangeListener(({ colorScheme }) => {
      // Only apply system changes if you want to follow system theme
      // Comment this out to make theme fully manual
      // runInAction(() => {
      //   this.isDark = colorScheme !== 'light';
      // });
    });
  }

  toggleTheme() {
    runInAction(() => {
      this.isDark = !this.isDark;
    });
  }

  setTheme(isDark: boolean) {
    runInAction(() => {
      this.isDark = isDark;
    });
  }

  setLoading(loading: boolean) {
    runInAction(() => {
      this.loading = loading;
    });
  }

  setError(error: string | null) {
    runInAction(() => {
      this.error = error;
    });
  }

  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }

  showSnackbar(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) {
    runInAction(() => {
      this.snackbar = {
        visible: true,
        message,
        type,
      };
    });
  }

  hideSnackbar() {
    runInAction(() => {
      this.snackbar = {
        visible: false,
        message: '',
        type: 'info',
      };
    });
  }

  reset() {
    this.isDark = true; // Reset to dark
    this.loading = false;
    this.error = null;
    this.snackbar = {
      visible: false,
      message: '',
      type: 'info',
    };
  }
}

export default UIStore;
