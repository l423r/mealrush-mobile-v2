/**
 * OAuth2 Configuration
 * 
 * IMPORTANT: 
 * - Web client secret should NEVER be used in mobile apps
 * - This file is here for reference only
 * - Mobile apps use client IDs only (stored in oauthUtils.ts)
 */

export const OAUTH_CONFIG = {
  google: {
    clientIds: {
      android: '808861089757-a6b05stnagv563pu9g83cmrcabua51rb.apps.googleusercontent.com',
      ios: '808861089757-1pgu9k50hpf9gg3kqsp36v3q7serv1jh.apps.googleusercontent.com',
      web: '808861089757-m436gdg6tr4n04nla83oo7le565mt7m0.apps.googleusercontent.com',
    },
    sha1Fingerprints: {
      debug: '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25',
    },
    // Web client secret - DO NOT USE IN MOBILE APP
    // Only for backend/web services
    webClientSecret: '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',
  },
  apple: {
    bundleId: 'com.l423r.FoodApp',
  },
} as const;

