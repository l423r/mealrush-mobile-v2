import { makeAutoObservable, runInAction } from 'mobx';
import { Appearance } from 'react-native';
import RootStore from './RootStore';

class UIStore {
  rootStore: RootStore;
  
  // State
  isDark: boolean = false;
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
    
    // Listen to system theme changes
    this.initializeTheme();
  }

  // Actions
  initializeTheme() {
    const colorScheme = Appearance.getColorScheme();
    runInAction(() => {
      this.isDark = colorScheme === 'dark';
    });
    
    // Listen for theme changes
    Appearance.addChangeListener(({ colorScheme }) => {
      runInAction(() => {
        this.isDark = colorScheme === 'dark';
      });
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

  showSnackbar(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
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
    this.isDark = false;
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