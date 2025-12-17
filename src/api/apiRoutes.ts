/**
 * API Routes Configuration
 */

// Base URL logic
const getBaseURL = () => {
    if (__DEV__) {
        // Development
        // Use 10.0.2.2 for Android Emulator
        // Use localhost for iOS Simulator
        // Use local IP for physical devices connected via USB
        // For USB-connected devices, use your computer's IP in the local network
        // return 'http://localhost:8083/my-food';
        return 'http://88.210.20.137:8083/my-food';
    } else {
        // Production
        return 'http://88.210.20.137:8083/my-food';
    }
};

export const API_BASE_URL = getBaseURL();

export const ApiRoutes = {
    // Auth
    Auth: {
        Login: '/auth/token',
        Register: '/api/auth/register',
        User: '/auth/user',
        ResetPassword: '/auth/reset-password',
        OAuth: '/auth/oauth',
    },

    // User Profile
    UserProfile: '/user-profile',

    // Products
    Product: {
        Base: '/product',
        SearchName: '/product/search/name',
        SearchBarcode: '/product/search/barcode',
        Categories: '/product_category',
    },

    // Meals
    Meal: {
        Base: '/meal',
        FindByDate: '/meal/findByDate',
    },

    // Meal Elements
    MealElement: {
        Base: '/meal_element',
        ByMeal: '/meal_element/meal',
        AnalyzePhoto: '/meal_element/analyze-photo',
        AnalyzeText: '/meal_element/analyze-text',
        AnalyzeAudio: '/meal_element/analyze-audio',
    },

    // Meal Templates
    MealTemplate: {
        Base: '/meal-template',
        FromMeal: '/meal-template/from-meal',
        Elements: '/meal-template-element',
        ElementsByTemplate: '/meal-template-element/template',
    },

    // Favorites
    Favorites: '/favorite',

    // Devices
    Devices: '/device',

    // Nutrition
    Nutrition: {
        Daily: '/nutrition/daily',
        Weekly: '/nutrition/weekly',
        Monthly: '/nutrition/monthly',
        Trend: '/nutrition/trend',
        Statistics: '/nutrition/statistics',
        Progress: '/nutrition/progress',
    },

    // Recommendations
    Recommendations: {
        Products: '/recommendations/products',
        Insights: '/recommendations/insights',
        Refresh: '/recommendations/refresh',
        Meals: '/recommendations/meals',
    },

    // Weight History
    WeightHistory: {
        Base: '/weight-history',
        Latest: '/weight-history/latest',
        Stats: '/weight-history/stats',
    },

    // Notifications
    Notifications: {
        Register: '/notifications/register',
        Device: '/notifications/device',
        Preferences: '/notifications/preferences',
        ResetPreferences: '/notifications/preferences/reset',
    },

    // Diet Chat (AI Dietitian)
    DietChat: {
        Sessions: '/diet-chat/sessions',
        DailyAnalysisStream: '/diet-chat/stream',
        Reply: '/diet-chat/reply',
    },

    // Friends
    Friends: {
        Base: '/friends',
        Requests: '/friends/requests',
        RequestsIncoming: '/friends/requests/incoming',
        RequestsOutgoing: '/friends/requests/outgoing',
        RequestAccept: (id: number) => `/friends/requests/${id}/accept`,
        RequestDecline: (id: number) => `/friends/requests/${id}/decline`,
        Permissions: (friendId: number) => `/friends/${friendId}/permissions`,
    },
} as const;

// Timeouts
export const Timeouts = {
    Default: 30000,
    PhotoAnalysis: 40000,
    TextAnalysis: 40000,
    AudioAnalysis: 40000,
} as const;
