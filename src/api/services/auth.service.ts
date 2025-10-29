import { apiClient } from '../axios.config';
import { AUTH_ENDPOINTS } from '../endpoints';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../../types/api.types';

export const authService = {
  login: (credentials: LoginRequest) =>
    apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials),
  
  register: (userData: RegisterRequest) =>
    apiClient.post<User>(AUTH_ENDPOINTS.REGISTER, userData),
  
  getUser: () =>
    apiClient.get<User>(AUTH_ENDPOINTS.USER),
  
  resetPassword: (email: string) =>
    apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { email }),
};