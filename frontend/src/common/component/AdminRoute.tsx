import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/auth/store/authStore";

/**
 * /admin/* 경로 가드.
 * 비로그인 → 로그인 페이지로, 로그인했지만 ADMIN이 아니면 → 홈으로 리다이렉트.
 */
export default function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return <Outlet />;
}
