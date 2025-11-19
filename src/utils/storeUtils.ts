import { runInAction } from 'mobx';

type AsyncAction<T> = () => Promise<T>;

interface StoreWithState {
  loading: boolean;
  error: string | null;
}

/**
 * Helper to handle async actions in MobX stores.
 * Automatically manages loading and error states.
 * 
 * @param store The store instance (must have loading and error properties)
 * @param action The async function to execute
 * @param errorMessage Custom error message or function to extract message from error
 * @returns The result of the action
 */
export async function withAsync<T>(
  store: StoreWithState,
  action: AsyncAction<T>,
  errorMessage: string | ((error: any) => string) = 'Произошла ошибка'
): Promise<T> {
  runInAction(() => {
    store.loading = true;
    store.error = null;
  });

  try {
    const result = await action();
    runInAction(() => {
      store.loading = false;
      store.error = null;
    });
    return result;
  } catch (error: any) {
    runInAction(() => {
      store.loading = false;
      if (typeof errorMessage === 'function') {
        store.error = errorMessage(error);
      } else {
        store.error = error.response?.data?.message || errorMessage;
      }
    });
    throw error;
  }
}
