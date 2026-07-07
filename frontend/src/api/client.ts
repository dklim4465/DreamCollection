import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const TOKEN_KEY = import.meta.env.VITE_JWT_KEY || "travelers_hub_token";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 백엔드가 아직 JWT 인증 대신 X-User-Id 헤더로 사용자를 식별하고 있어서 임시로 같이 붙여줌.
  // 나중에 백엔드가 JWT에서 사용자를 추출하도록 바뀌면 이 부분은 지워도 됨.
  const userId = useAuthStore.getState().user?.id;
  if (userId) config.headers["X-User-Id"] = String(userId);

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default apiClient;

// authStore가 새로고침하면 user는 사라지고 토큰만 남아서, 새로고침 직후엔 X-User-Id가 안 붙어 댓글/좋아요가 실패할 수 있어.
// 로그인 상태 유지 로직 만들 때 같이 손봐야함
