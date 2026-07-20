import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "@/common/components/AdminRoute";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import NotFoundPage from "@/common/components/NotFoundPage";
import PrivateRoute from "@/common/components/PrivateRoute";
import AppLayout from "@/common/layout/AppLayout";
import {
  AdminBannersPage,
  AdminBoardPage,
  AdminDashboardPage,
  AdminFeedbackPage,
  AdminLayout,
  AdminMainBackgroundsPage,
  AdminMonthlyDestinationsPage,
  AdminNoticesPage,
  AdminUsersPage,
  BillingFailPage,
  BillingSuccessPage,
  BoardDetailPage,
  BoardWritePage,
  CardRegisterPage,
  CheckoutPage,
  CityDetailPage,
  CommunityPage,
  FeedbackPage,
  ForgotPasswordPage,
  HomePage,
  KakaoCallbackPage,
  LoginPage,
  MateDetailPage,
  MateWritePage,
  MatchingPage,
  NoticeDetailPage,
  NoticeListPage,
  PaymentCompletePage,
  ProfilePage,
  RegisterPage,
  TravelPlanPage,
  TripAccommodationSelectPage,
  TripFlightSelectPage,
  TripLogDetailPage,
  TripLogMainPage,
  TripLogMapLayout,
  TripResultPage,
  TripSavedDetailPage,
  TripSavedListPage,
} from "@/lazyPages";

/**
 * Path map (실제 URL)
 *
 * 인증: /login /register /forgot-password /oauth/callback/kakao
 * 공개: / /destinations/:cityId
 * 일정: /trip /trip/new /trip/flight /trip/accommodation /trip/result
 *       /trip/saved /trip/saved/:savedTripId /trip/edit  (로그인)
 * 커뮤니티: /community /community/new /community/:postId /community/:postId/edit
 * 매칭: /matching /matching/new /matching/:matePostId /matching/:matePostId/edit
 * 기타: /notices /notices/:noticeId /feedback
 * 회원: /payment/checkout /payment/complete /triplog /profile
 *       /register/card /billing/success /billing/fail
 * 관리자: /admin /admin/dashboard /admin/banners /admin/main-backgrounds
 *         /admin/notices /admin/monthly-destinations /admin/board /admin/feedback /admin/users
 * 레이아웃 밖: /triplog/:tno
 */
export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner message="페이지를 불러오고 있어요." />}>
      <Routes>
        {/* ── 인증 (레이아웃 밖) ── */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="oauth/callback/kakao" element={<KakaoCallbackPage />} />

        <Route element={<AppLayout />}>
          {/* ── 공개 ── */}
          <Route index element={<HomePage />} />
          <Route path="destinations/:cityId" element={<CityDetailPage />} />

          {/* ── 일정 ── */}
          <Route path="trip" element={<TravelPlanPage />} />
          <Route path="trip/new" element={<TravelPlanPage />} />
          <Route path="trip/flight" element={<TripFlightSelectPage />} />
          <Route
            path="trip/accommodation"
            element={<TripAccommodationSelectPage />}
          />
          <Route path="trip/result" element={<TripResultPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="trip/saved" element={<TripSavedListPage />} />
            <Route
              path="trip/saved/:savedTripId"
              element={<TripSavedDetailPage />}
            />
            <Route path="trip/edit" element={<TripResultPage />} />
          </Route>

          {/* ── 커뮤니티 · 매칭 · 공지 ── */}
          <Route path="community" element={<CommunityPage />} />
          <Route path="community/new" element={<BoardWritePage />} />
          <Route path="community/:postId" element={<BoardDetailPage />} />
          <Route path="community/:postId/edit" element={<BoardWritePage />} />
          <Route path="matching" element={<MatchingPage />} />
          <Route path="matching/new" element={<MateWritePage />} />
          <Route path="matching/:matePostId" element={<MateDetailPage />} />
          <Route path="matching/:matePostId/edit" element={<MateWritePage />} />
          <Route path="notices" element={<NoticeListPage />} />
          <Route path="notices/:noticeId" element={<NoticeDetailPage />} />
          <Route path="feedback" element={<FeedbackPage />} />

          {/* ── 회원 (로그인) ── */}
          <Route element={<PrivateRoute />}>
            <Route path="payment/checkout" element={<CheckoutPage />} />
            <Route path="payment/complete" element={<PaymentCompletePage />} />
            <Route path="records" element={<Navigate to="/triplog" replace />} />
            <Route path="triplog" element={<TripLogMainPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="register/card" element={<CardRegisterPage />} />
            <Route path="billing/success" element={<BillingSuccessPage />} />
            <Route path="billing/fail" element={<BillingFailPage />} />
          </Route>

          {/* ── 관리자 (Outlet용 중첩 유지) ── */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
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
              <Route path="board" element={<AdminBoardPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ── 여행기 상세 (풀맵, 레이아웃 밖) ── */}
        <Route element={<PrivateRoute />}>
          <Route element={<TripLogMapLayout />}>
            <Route path="triplog/:tno" element={<TripLogDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
