import { makeAutoObservable } from 'mobx';
import AuthStore from './AuthStore';
import ProfileStore from './ProfileStore';
import ProductStore from './ProductStore';
import MealStore from './MealStore';
import UIStore from './UIStore';

class RootStore {
  authStore: AuthStore;
  profileStore: ProfileStore;
  productStore: ProductStore;
  mealStore: MealStore;
  uiStore: UIStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.profileStore = new ProfileStore(this);
    this.productStore = new ProductStore(this);
    this.mealStore = new MealStore(this);
    this.uiStore = new UIStore(this);
    
    makeAutoObservable(this);
  }

  // Reset all stores (for logout)
  reset() {
    this.authStore.reset();
    this.profileStore.reset();
    this.productStore.reset();
    this.mealStore.reset();
    this.uiStore.reset();
  }
}

export default RootStore;