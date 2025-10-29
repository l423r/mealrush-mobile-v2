import { authClient } from '../axios.config';
import { AUTH_ENDPOINTS } from '../endpoints';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../../types/api.types';

export const authService = {
  login: (credentials: LoginRequest) =>
    authClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials),
  
  register: (userData: RegisterRequest) =>
    authClient.post<User>(AUTH_ENDPOINTS.REGISTER, userData),
  
  getUser: () =>
    authClient.get<User>(AUTH_ENDPOINTS.USER),
  
  resetPassword: (email: string) =>
    authClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { email }),
};