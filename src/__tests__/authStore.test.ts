import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthStore from '../stores/AuthStore';
import type { RegisterRequest, RegisterResponse } from '../types/api.types';

// AsyncStorage mock to avoid RN window dependency in tests
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

const registerMock = vi.fn();
vi.mock('../api/services/auth.service', () => ({
  authService: {
    register: (...args: unknown[]) => registerMock(...args),
  },
}));

// Minimal stub rootStore for AuthStore
const createRootStoreStub = () =>
  ({
    notificationStore: {
      registerForPushNotifications: vi.fn().mockResolvedValue(undefined),
    },
  } as any);

describe('AuthStore.register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores jwt, user and marks authenticated on success', async () => {
    const rootStore = createRootStoreStub();
    const store = new AuthStore(rootStore);

    const payload: RegisterRequest = {
      email: 'user@example.com',
      password: 'Password123',
      name: 'User',
      verificationEnabled: true,
    };

    const responseData: RegisterResponse = {
      jwtToken: 'token-123',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 1,
        email: payload.email,
        name: payload.name,
        avatarUrl: null,
        oauthProvider: null,
        roles: ['USER'],
      },
      verificationRequired: true,
      verificationMessage: 'Check your email',
    };

    registerMock.mockResolvedValue({ data: responseData });

    const result = await store.register(payload);

    expect(registerMock).toHaveBeenCalledWith(payload);
    expect(saveTokenMock).toHaveBeenCalledWith('token-123');
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe('token-123');
    expect(store.user?.email).toBe(payload.email);
    expect(result?.verificationRequired).toBe(true);
    expect(result?.verificationMessage).toBe('Check your email');
  });

  it('propagates backend errors and preserves state when failed', async () => {
    const rootStore = createRootStoreStub();
    const store = new AuthStore(rootStore);

    const error = new Error('Conflict');
    (error as any).response = { data: { message: 'Email exists' } };
    registerMock.mockRejectedValue(error);

    await expect(
      store.register({
        email: 'dup@example.com',
        password: 'Password123',
        name: 'Dup',
      })
    ).rejects.toThrowError('Conflict');

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(saveTokenMock).not.toHaveBeenCalled();
    expect(store.error).toBe('Email exists');
  });

  it('sets generic error when no response payload is provided (network/timeout)', async () => {
    const rootStore = createRootStoreStub();
    const store = new AuthStore(rootStore);

    const error = new Error('Network error');
    registerMock.mockRejectedValue(error);

    await expect(
      store.register({
        email: 'net@example.com',
        password: 'Password123',
        name: 'Net',
      })
    ).rejects.toThrowError('Network error');

    expect(store.isAuthenticated).toBe(false);
    expect(store.error).toBe('Ошибка регистрации');
  });

  it('keeps loading false after failure', async () => {
    const rootStore = createRootStoreStub();
    const store = new AuthStore(rootStore);

    const error = new Error('Timeout');
    registerMock.mockRejectedValue(error);

    await expect(
      store.register({
        email: 'timeout@example.com',
        password: 'Password123',
        name: 'Timeout',
      })
    ).rejects.toThrowError('Timeout');

    expect(store.loading).toBe(false);
  });
});
