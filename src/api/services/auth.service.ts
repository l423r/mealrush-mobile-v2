import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  OAuthRequest,
  OAuthResponse,
} from '../../types/api.types';

export const authService = {
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>(ApiRoutes.Auth.Login, credentials),

  register: (userData: RegisterRequest) =>
    apiClient.post<User>(ApiRoutes.Auth.Register, userData),

  getUser: () => apiClient.get<User>(ApiRoutes.Auth.User),

  resetPassword: (email: string) =>
    apiClient.post(ApiRoutes.Auth.ResetPassword, { email }),

  oauth: (oauthData: OAuthRequest) =>
    apiClient.post<OAuthResponse>(ApiRoutes.Auth.OAuth, oauthData),
};
