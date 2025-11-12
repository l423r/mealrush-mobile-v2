import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = {
  ios: '808861089757-1pgu9k50hpf9gg3kqsp36v3q7serv1jh.apps.googleusercontent.com',
  android: '808861089757-a6b05stnagv563pu9g83cmrcabua51rb.apps.googleusercontent.com',
  web: '808861089757-m436gdg6tr4n04nla83oo7le565mt7m0.apps.googleusercontent.com',
};

// Configure Google Sign In on module load
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID.web, // Required for backend verification
  iosClientId: GOOGLE_CLIENT_ID.ios,
  offlineAccess: true, // To get refresh token
});

export interface GoogleAuthResult {
  idToken: string;
  user: {
    email: string;
    name: string;
    photo?: string;
  };
}

export interface AppleAuthResult {
  idToken: string;
  authorizationCode: string;
  user?: {
    email: string;
    name: string;
  };
}

/**
 * Sign in with Google using native SDK
 * Uses Android Client ID on Android and iOS Client ID on iOS
 * 
 * @returns {Promise<GoogleAuthResult>} Google auth result with idToken
 * @throws {Error} If sign in fails or user cancels
 */
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    // Check if device has Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Sign in
    const response = await GoogleSignin.signIn();
    
    // Get tokens - structure changed in v10+
    const tokens = await GoogleSignin.getTokens();
    
    if (!tokens.idToken) {
      throw new Error('No ID token received from Google');
    }

    return {
      idToken: tokens.idToken,
      user: {
        email: response.data?.user.email || '',
        name: response.data?.user.name || '',
        photo: response.data?.user.photo || undefined,
      },
    };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    
    // Handle specific error codes
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Вход отменен пользователем');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Вход уже выполняется');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services недоступен');
    }
    
    throw error;
  }
};

/**
 * Sign out from Google (useful for testing)
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

/**
 * Sign in with Apple using expo-apple-authentication
 * 
 * @returns {Promise<AppleAuthResult>} Apple auth result with idToken
 * @throws {Error} If Apple Sign In is not available or sign in fails
 */
export const signInWithApple = async (): Promise<AppleAuthResult> => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign In is only available on iOS');
  }

  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Apple Sign In is not available on this device');
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('No identity token received from Apple');
  }

  return {
    idToken: credential.identityToken,
    authorizationCode: credential.authorizationCode || '',
    user: credential.email
      ? {
          email: credential.email,
          name: credential.fullName
            ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
            : '',
        }
      : undefined,
  };
};
