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
      android: 'change_me',
      ios: 'change_me',
      web: 'change_me',
    },
    sha1Fingerprints: {
      debug: 'change_me',
    },
    // Web client secret - DO NOT USE IN MOBILE APP
    // Only for backend/web services
    webClientSecret: 'change_me',
  },
  apple: {
    bundleId: 'com.l423r.FoodApp',
  },
} as const;

