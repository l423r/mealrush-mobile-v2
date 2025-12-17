import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthStore from '../stores/AuthStore';
import type { LoginRequest, LoginResponse } from '../types/api.types';

// AsyncStorage mock
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mocks
const saveTokenMock = vi.fn();
vi.mock('../api/axios.config', () => ({
  saveToken: (...args: unknown[]) => saveTokenMock(...args),
  deleteToken: vi.fn(),
  getToken: vi.fn(),
}));

const loginMock = vi.fn();
vi.mock('../api/services/auth.service', () => ({
  authService: {
    login: (...args: unknown[]) => loginMock(...args),
  },
}));

const createRootStoreStub = () =>
  ({
    profileStore: {
      checkProfile: vi.fn().mockResolvedValue(undefined),
    },
    notificationStore: {
      registerForPushNotifications: vi.fn().mockResolvedValue(undefined),
    },
  } as any);

describe('AuthStore.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets token, user and auth flags on success', async () => {
    const rootStore = createRootStoreStub();
    const store = new AuthStore(rootStore);

    const payload: LoginRequest = { email: 'user@example.com', password: 'Password123' };
    const responseData: LoginResponse = {
      jwtToken: 'jwt-abc',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 2,
        email: payload.email,
        name: 'User',
        avatarUrl: null,
        oauthProvider: null,
        roles: ['USER'],
      },
    };

    loginMock.mockResolvedValue({ data: responseData });

    await store.login(payload);

    expect(loginMock).toHaveBeenCalledWith(payload);
    expect(saveTokenMock).toHaveBeenCalledWith('jwt-abc');
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('jwt-abc');
    expect(store.user?.email).toBe(payload.email);
    expect(rootStore.profileStore.checkProfile).toHaveBeenCalled();
  });

  it('captures backend message on failure and keeps auth state cleared', async () => {
    const rootStore = createRootStoreStub();
    const store = new AuthStore(rootStore);

    const error = new Error('Unauthorized');
    (error as any).response = { data: { message: 'Invalid email or password' } };
    loginMock.mockRejectedValue(error);

    await expect(
      store.login({ email: 'wrong@example.com', password: 'wrongpass' })
    ).rejects.toThrowError('Unauthorized');

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.error).toBe('Invalid email or password');
  });

  it('uses generic error when response payload is missing', async () => {
    const rootStore = createRootStoreStub();
    const store = new AuthStore(rootStore);

    const error = new Error('Network');
    loginMock.mockRejectedValue(error);

    await expect(
      store.login({ email: 'user@example.com', password: 'Password123' })
    ).rejects.toThrowError('Network');

    expect(store.error).toBe('Ошибка входа');
    expect(store.isAuthenticated).toBe(false);
  });
});
