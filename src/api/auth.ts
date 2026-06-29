import apiClient from './client';
import type { ApiResponse, User } from '@/types';

export interface LoginReq   { email: string; password: string; }
export interface RegisterReq{ email: string; password: string; nickname: string; travelStyle: string; }
export interface AuthRes    { accessToken: string; user: User; }

export const authApi = {
  login:    (d: LoginReq)    => apiClient.post<ApiResponse<AuthRes>>('/auth/login', d),
  register: (d: RegisterReq) => apiClient.post<ApiResponse<AuthRes>>('/auth/register', d),
  getMe:    ()               => apiClient.get<ApiResponse<User>>('/auth/me'),
  logout:   ()               => apiClient.post('/auth/logout'),
};
