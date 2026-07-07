import axios from 'axios';
import { getRefreshToken, useAuthStore } from '@/auth/store/authStore';

const TOKEN_KEY = import.meta.env.VITE_JWT_KEY || 'travelers_hub_token';

// 백엔드가 프론트와 다른 포트(8080)에서 실행되므로 절대경로로 지정
// .env에 VITE_API_BASE_URL을 설정해두면 배포 시에도 쉽게 바꿀 수 있음
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // 로그인/회원가입 자체가 실패한 경우(비밀번호 틀림 등)는 그냥 에러로 처리
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login')
      || originalRequest?.url?.includes('/auth/signup');

    if (err.response?.status === 401 && !isAuthEndpoint && !originalRequest?._retry && !isRefreshing) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken, user } = res.data.data;
          useAuthStore.getState().setUser(user, accessToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      } else {
        useAuthStore.getState().logout();
        // 공개 페이지(메인 등)에서 보호되지 않은 API가 잘못 401을 받는 경우까지
        // 강제로 로그인 페이지로 보내면 안 되므로, 이미 보호된 페이지에 있을 때만 이동
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/community')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(err);
  }
);

export default apiClient;