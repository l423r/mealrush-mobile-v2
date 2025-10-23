import React from 'react';
import RootStore from './RootStore';

const StoreContext = React.createContext<RootStore | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const rootStore = React.useMemo(() => new RootStore(), []);
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
};

export const useStores = () => {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error('useStores must be used within StoreProvider');
  }
  return store;
};

export { RootStore };