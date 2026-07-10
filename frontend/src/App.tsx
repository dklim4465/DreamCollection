import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingSpinner from "./common/component/LoadingSpinner";
import PrivateRoute from "./common/component/PrivateRoute";
import AdminRoute from "./common/component/AdminRoute";
import AppLayout from "./common/layout/AppLayout";
import TripResultPage from "@/trip/page/TripResultPage";
import TripHubPage from "@/trip/page/TripHubPage";
import TripSavedListPage from "@/trip/page/TripSavedListPage";
import TravelPlanPage from "@/trip/page/TravelPlanPage";
import { MapProvider } from "@/travelog/map/MapProvider";

// ── 코드 스플리팅 (lazy import) ──────────────────────────────
const LoginPage = lazy(() => import("./auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./auth/pages/RegisterPage"));
const KakaoCallbackPage = lazy(() => import("./auth/pages/KakaoCallbackPage"));

const HomePage = lazy(() => import("./home/pages/HomePage"));
const CommunityPage = lazy(() => import("@/board/pages/CommunityPage"));
const BoardDetailPage = lazy(() => import("@/board/pages/BoardDetailPage"));
const BoardWritePage = lazy(() => import("@/board/pages/BoardWritePage"));
const MatchingPage = lazy(() => import("@/pages/MatchingPage"));

const CartPage = lazy(() => import("./payment/pages/CartPage"));
const RecordsPage = lazy(() => import("./records/pages/RecordsPage"));
const ProfilePage = lazy(() => import("./profile/pages/ProfilePage"));

const AdminLayout = lazy(() => import("./admin/pages/AdminLayout"));
const AdminBannersPage = lazy(() => import("./admin/pages/AdminBannersPage"));
const AdminMainBackgroundsPage = lazy(
  () => import("./admin/pages/AdminMainBackgroundsPage"),
);
const AdminNoticesPage = lazy(() => import("./admin/pages/AdminNoticesPage"));
const AdminMonthlyDestinationsPage = lazy(
  () => import("./admin/pages/AdminMonthlyDestinationsPage"),
);
const AdminUsersPage = lazy(() => import("./admin/pages/AdminUsersPage"));

// TODO: 아래 페이지는 각 팀원이 추가
// const MatchingDetailPage = lazy(() => import('@/pages/MatchingDetailPage'));
// ─────────────────────────────────────────────────────────────
// 여행 기록
const TripLogMainPage = lazy(() => import("./travelog/page/TripLogMainPage"));
const TripLogDetailPage = lazy(
  () => import("./travelog/page/TripLogDetailPage"),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MapProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner message="페이지 로딩 중..." />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/oauth/callback/kakao"
                element={<KakaoCallbackPage />}
              />

              {/* Layout 포함 라우트 */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />

                <Route path="/trip" element={<TripHubPage />} />
                <Route path="/trip/new" element={<TravelPlanPage />} />
                <Route path="/trip/result" element={<TripResultPage />} />

                {/* 로그인 필요 */}
                <Route element={<PrivateRoute />}>
                  <Route path="/trip/saved" element={<TripSavedListPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/records" element={<RecordsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/community/new" element={<BoardWritePage />} />
                  <Route
                    path="/community/:postId"
                    element={<BoardDetailPage />}
                  />
                  <Route
                    path="/community/:postId/edit"
                    element={<BoardWritePage />}
                  />
                  <Route path="/matching" element={<MatchingPage />} />
                </Route>

                {/* 관리자 전용 (role=ADMIN) */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={<Navigate to="/admin/banners" replace />}
                    />
                    <Route path="banners" element={<AdminBannersPage />} />
                    <Route
                      path="main-backgrounds"
                      element={<AdminMainBackgroundsPage />}
                    />
                    <Route path="notices" element={<AdminNoticesPage />} />
                    <Route
                      path="monthly-destinations"
                      element={<AdminMonthlyDestinationsPage />}
                    />
                    <Route path="users" element={<AdminUsersPage />} />
                  </Route>
                </Route>
              </Route>

              {/* 여행 기록 */}
              <Route path="/triplog" element={<TripLogMainPage />} />
              <Route path="/triplog/:tno" element={<TripLogDetailPage />} />

              {/* 404 처리 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </MapProvider>
    </QueryClientProvider>
  );
}
