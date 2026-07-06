import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import PrivateRoute from "@/components/common/PrivateRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// ── 코드 스플리팅 (lazy import) ──────────────────────────────
const HomePage = lazy(() => import("@/pages/HomePage"));
const CommunityPage = lazy(() => import("@/pages/CommunityPage"));
const MatchingPage = lazy(() => import("@/pages/MatchingPage"));
const TravelPlanPage = lazy(() => import("@/pages/TravelPlanPage"));
const RecordsPage = lazy(() => import("@/pages/RecordsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

// TODO: 아래 페이지는 각 팀원이 추가
// const CommunityDetailPage= lazy(() => import('@/pages/CommunityDetailPage'));
// const MatchingDetailPage = lazy(() => import('@/pages/MatchingDetailPage'));
// const TravelFormPage     = lazy(() => import('@/pages/TravelFormPage'));
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

            {/* Layout 포함 라우트 */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/matching" element={<MatchingPage />} />

              {/* 로그인 필요 */}
              <Route element={<PrivateRoute />}>
                <Route path="/trip" element={<TravelPlanPage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* TODO: /plan/new, /plan/:id, /community/new 등 추가 */}
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
