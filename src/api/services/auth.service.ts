import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  User,
  OAuthRequest,
  OAuthResponse,
} from '../../types/api.types';

export const authService = {
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>(ApiRoutes.Auth.Login, credentials),

  refreshToken: (request: RefreshTokenRequest) =>
    apiClient.post<LoginResponse>(ApiRoutes.Auth.Refresh, request),

  logout: () => apiClient.post(ApiRoutes.Auth.Logout),

  register: (userData: RegisterRequest) =>
    apiClient.post<User>(ApiRoutes.Auth.Register, userData),

  getUser: () => apiClient.get<User>(ApiRoutes.Auth.User),

  resetPassword: (email: string) =>
    apiClient.post<{ message: string }>(ApiRoutes.Auth.ResetPassword, { email }),

  validateResetToken: (token: string) =>
    apiClient.post<{ message: string }>(ApiRoutes.Auth.ValidateResetToken, { token }),

  completePasswordReset: (token: string, newPassword: string) =>
    apiClient.post<{ message: string }>(ApiRoutes.Auth.CompletePasswordReset, {
      token,
      newPassword,
    }),

  oauth: (oauthData: OAuthRequest) =>
    apiClient.post<OAuthResponse>(ApiRoutes.Auth.OAuth, oauthData),
};
