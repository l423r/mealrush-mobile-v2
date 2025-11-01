import { makeAutoObservable } from 'mobx';
import AuthStore from './AuthStore';
import ProfileStore from './ProfileStore';
import ProductStore from './ProductStore';
import MealStore from './MealStore';
import UIStore from './UIStore';
import NutritionStore from './NutritionStore';
import RecommendationsStore from './RecommendationsStore';
import WeightStore from './WeightStore';

class RootStore {
  authStore: AuthStore;
  profileStore: ProfileStore;
  productStore: ProductStore;
  mealStore: MealStore;
  uiStore: UIStore;
  nutritionStore: NutritionStore;
  recommendationsStore: RecommendationsStore;
  weightStore: WeightStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.profileStore = new ProfileStore(this);
    this.productStore = new ProductStore(this);
    this.mealStore = new MealStore(this);
    this.uiStore = new UIStore(this);
    this.nutritionStore = new NutritionStore(this);
    this.recommendationsStore = new RecommendationsStore(this);
    this.weightStore = new WeightStore(this);

    makeAutoObservable(this);
  }

  // Reset all stores (for logout)
  reset() {
    this.authStore.reset();
    this.profileStore.reset();
    this.productStore.reset();
    this.mealStore.reset();
    this.uiStore.reset();
    this.nutritionStore.reset();
    this.recommendationsStore.reset();
    this.weightStore.reset();
  }
}

export default RootStore;
