import { makeAutoObservable } from 'mobx';
import AuthStore from './AuthStore';
import ProfileStore from './ProfileStore';
import ProductStore from './ProductStore';
import MealStore from './MealStore';
import UIStore from './UIStore';
import NutritionStore from './NutritionStore';
import RecommendationsStore from './RecommendationsStore';
import WeightStore from './WeightStore';
import NotificationStore from './NotificationStore';
import MealTemplateStore from './MealTemplateStore';
import DietChatStore from './DietChatStore';
import FriendsStore from './FriendsStore';
import AccountStore from './AccountStore';

class RootStore {
  authStore: AuthStore;
  profileStore: ProfileStore;
  productStore: ProductStore;
  mealStore: MealStore;
  uiStore: UIStore;
  nutritionStore: NutritionStore;
  recommendationsStore: RecommendationsStore;
  weightStore: WeightStore;
  notificationStore: NotificationStore;
  mealTemplateStore: MealTemplateStore;
  dietChatStore: DietChatStore;
  friendsStore: FriendsStore;
  accountStore: AccountStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.profileStore = new ProfileStore(this);
    this.productStore = new ProductStore(this);
    this.mealStore = new MealStore(this);
    this.uiStore = new UIStore(this);
    this.nutritionStore = new NutritionStore(this);
    this.recommendationsStore = new RecommendationsStore(this);
    this.weightStore = new WeightStore(this);
    this.notificationStore = new NotificationStore(this);
    this.mealTemplateStore = new MealTemplateStore(this);
    this.dietChatStore = new DietChatStore(this);
    this.friendsStore = new FriendsStore(this);
    this.accountStore = new AccountStore(this);

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
    this.notificationStore.reset();
    this.mealTemplateStore.reset();
    this.dietChatStore.reset();
    this.friendsStore.reset();
    this.accountStore.reset();
  }
}

export default RootStore;
