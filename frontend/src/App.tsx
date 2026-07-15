import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingSpinner from "./common/component/LoadingSpinner";
import PrivateRoute from "./common/component/PrivateRoute";
import AdminRoute from "./common/component/AdminRoute";
import AppLayout from "./common/layout/AppLayout";
import { authApi } from "@/auth/api/authApi";
import { useAuthStore } from "@/auth/store/authStore";
import { MapProvider } from "@/travelog/map/MapProvider";

// ── 코드 스플리팅 (lazy import) ──────────────────────────────
const CardRegisterPage = lazy(() => import("./payment/pages/CardRegisterPage"));
const BillingSuccessPage = lazy(
  () => import("./payment/pages/BillingSuccessPage"),
);
const BillingFailPage = lazy(() => import("./payment/pages/BillingFailPage"));

const LoginPage = lazy(() => import("./auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("./auth/pages/ForgotPasswordPage"),
);
const KakaoCallbackPage = lazy(() => import("./auth/pages/KakaoCallbackPage"));

const HomePage = lazy(() => import("./home/pages/HomePage"));
const TravelPlanPage = lazy(() => import("@/trip/page/TravelPlanPage"));
const TripFlightSelectPage = lazy(
  () => import("@/trip/page/TripFlightSelectPage"),
);
const TripAccommodationSelectPage = lazy(
  () => import("@/trip/page/TripAccommodationSelectPage"),
);
const TripResultPage = lazy(() => import("@/trip/page/TripResultPage"));
const TripSavedListPage = lazy(() => import("@/trip/page/TripSavedListPage"));
const TripSavedDetailPage = lazy(
  () => import("@/trip/page/TripSavedDetailPage"),
);
const CommunityPage = lazy(() => import("@/board/pages/CommunityPage"));
const BoardDetailPage = lazy(() => import("@/board/pages/BoardDetailPage"));
const BoardWritePage = lazy(() => import("@/board/pages/BoardWritePage"));
const MatchingPage = lazy(() => import("@/mate/pages/MatchingPage"));
const MateWritePage = lazy(() => import("@/mate/pages/MateWritePage"));
const MateDetailPage = lazy(() => import("@/mate/pages/MateDetailPage"));

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
// const CommunityDetailPage= lazy(() => import('@/pages/CommunityDetailPage'));
// const MatchingDetailPage = lazy(() => import('@/pages/MatchingDetailPage'));
// ─────────────────────────────────────────────────────────────
const TripLogMainPage = lazy(() => import("./travelog/page/TripLogMainPage"));
const TripLogDetailPage = lazy(
  () => import("./travelog/page/TripLogDetailPage"),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

/**
 * 새로고침 직후 대응: 토큰(isAuthenticated)은 localStorage에 남아있지만
 * user 정보는 메모리에서 날아간 상태이므로, 앱 시작 시 한 번 /api/auth/me로
 * 최신 유저 정보를 복구한다. 토큰이 만료/무효면 로그아웃 처리.
 */
function AuthBootstrap() {
  useEffect(() => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated || user) return;

    authApi
      .getMe()
      .then((res) => {
        const me = res.data?.data;
        if (me) useAuthStore.getState().hydrateUser(me);
        else useAuthStore.getState().logout();
      })
      .catch(() => useAuthStore.getState().logout());
  }, []);

  return null;
}

export default function App() {
  const { isAuthenticated, updateUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    authApi.getMe().then((res) => {
      if (res.data.data) {
        updateUser(res.data.data);
      }
    });
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <MapProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner message="페이지 로딩 중..." />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/oauth/callback/kakao"
                element={<KakaoCallbackPage />}
              />

              {/* Layout 포함 라우트 */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/trip">
                  <Route index element={<TravelPlanPage />} />
                  <Route path="new" element={<TravelPlanPage />} />
                  <Route path="flight" element={<TripFlightSelectPage />} />
                  <Route
                    path="accommodation"
                    element={<TripAccommodationSelectPage />}
                  />
                  <Route path="result" element={<TripResultPage />} />

                  <Route element={<PrivateRoute />}>
                    <Route path="saved" element={<TripSavedListPage />} />
                    <Route
                      path="saved/:savedTripId"
                      element={<TripSavedDetailPage />}
                    />
                    <Route path="edit" element={<TripResultPage />} />
                  </Route>
                </Route>
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

                {/* 순서 중요: /matching/new, /matching/:id/edit이
                    /matching/:matePostId보다 먼저 와야
                    "new"가 파라미터로 잘못 매칭되지 않음 */}
                <Route path="/matching" element={<MatchingPage />} />
                <Route path="/matching/new" element={<MateWritePage />} />
                <Route
                  path="/matching/:matePostId/edit"
                  element={<MateWritePage />}
                />
                <Route
                  path="/matching/:matePostId"
                  element={<MateDetailPage />}
                />

                {/* 로그인 필요 */}
                <Route element={<PrivateRoute />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/records" element={<RecordsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/register/card" element={<CardRegisterPage />} />
                  <Route
                    path="/billing/success"
                    element={<BillingSuccessPage />}
                  />
                  <Route path="/billing/fail" element={<BillingFailPage />} />
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

              {/* 여행기록 */}
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
