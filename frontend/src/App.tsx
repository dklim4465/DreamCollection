import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/common/layout/AppLayout";
import PrivateRoute from "@/common/component/PrivateRoute";
import AdminRoute from "@/common/component/AdminRoute";
import LoadingSpinner from "@/common/component/LoadingSpinner";

// ── 코드 스플리팅 (lazy import) ──────────────────────────────
const HomePage = lazy(() => import("@/home/pages/HomePage"));
const CommunityPage = lazy(() => import("@/community/pages/CommunityPage"));
const MatchingPage = lazy(() => import("@/matching/pages/MatchingPage"));
const TravelPlanPage = lazy(() => import("@/travelPlan/pages/TravelPlanPage"));
const TravelPlanFormPage = lazy(() => import("@/travelPlan/pages/TravelPlanFormPage"));
const TravelPlanDetailPage = lazy(() => import("@/travelPlan/pages/TravelPlanDetailPage"));
const CartPage = lazy(() => import("@/payment/pages/CartPage"));
const RecordsPage = lazy(() => import("@/records/pages/RecordsPage"));
const LoginPage = lazy(() => import("@/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/auth/pages/RegisterPage"));
const KakaoCallbackPage = lazy(() => import("@/auth/pages/KakaoCallbackPage"));
const CardRegisterPage = lazy(() => import("@/payment/pages/CardRegisterPage"));
const BillingSuccessPage = lazy(() => import("@/payment/pages/BillingSuccessPage"));
const BillingFailPage = lazy(() => import("@/payment/pages/BillingFailPage"));
const ProfilePage = lazy(() => import("@/profile/pages/ProfilePage"));
const AdminLayout = lazy(() => import("@/admin/pages/AdminLayout"));
const AdminBannersPage = lazy(() => import("@/admin/pages/AdminBannersPage"));
const AdminMainBackgroundsPage = lazy(() => import("@/admin/pages/AdminMainBackgroundsPage"));
const AdminNoticesPage = lazy(() => import("@/admin/pages/AdminNoticesPage"));
const AdminMonthlyDestinationsPage = lazy(() => import("@/admin/pages/AdminMonthlyDestinationsPage"));
const AdminUsersPage = lazy(() => import("@/admin/pages/AdminUsersPage"));

// TODO: 아래 페이지는 각 팀원이 추가
// const CommunityDetailPage= lazy(() => import('@/community/pages/CommunityDetailPage'));
// const MatchingDetailPage = lazy(() => import('@/matching/pages/MatchingDetailPage'));
// ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner message="페이지 로딩 중..." />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth/callback/kakao" element={<KakaoCallbackPage />} />

            {/* Layout 포함 라우트 */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/matching" element={<MatchingPage />} />

              {/* 로그인 필요 */}
              <Route element={<PrivateRoute />}>
                <Route path="/plan" element={<TravelPlanPage />} />
                <Route path="/plan/new" element={<TravelPlanFormPage />} />
                <Route path="/plan/:id" element={<TravelPlanDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/register/card" element={<CardRegisterPage />} />
                <Route path="/billing/success" element={<BillingSuccessPage />} />
                <Route path="/billing/fail" element={<BillingFailPage />} />
                {/* TODO: /community/new 등 추가 */}
              </Route>

              {/* 관리자 전용 */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/banners" replace />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="main-backgrounds" element={<AdminMainBackgroundsPage />} />
                  <Route path="notices" element={<AdminNoticesPage />} />
                  <Route path="monthly-destinations" element={<AdminMonthlyDestinationsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* 404 처리 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
