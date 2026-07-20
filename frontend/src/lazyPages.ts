import { lazy } from "react";

/** App.tsx 라우트용 lazy 페이지 모음 (라우트 정의는 App.tsx에 유지) */

export const LoginPage = lazy(() => import("@/auth/pages/LoginPage"));
export const RegisterPage = lazy(() => import("@/auth/pages/RegisterPage"));
export const ForgotPasswordPage = lazy(
  () => import("@/auth/pages/ForgotPasswordPage"),
);
export const KakaoCallbackPage = lazy(
  () => import("@/auth/pages/KakaoCallbackPage"),
);

export const HomePage = lazy(() => import("@/home/HomePage"));
export const CityDetailPage = lazy(
  () => import("@/destination/CityDetailPage"),
);

export const TravelPlanPage = lazy(() => import("@/trip/page/TravelPlanPage"));
export const TripFlightSelectPage = lazy(
  () => import("@/trip/page/TripFlightSelectPage"),
);
export const TripAccommodationSelectPage = lazy(
  () => import("@/trip/page/TripAccommodationSelectPage"),
);
export const TripResultPage = lazy(() => import("@/trip/page/TripResultPage"));
export const TripSavedListPage = lazy(
  () => import("@/trip/page/TripSavedListPage"),
);
export const TripSavedDetailPage = lazy(
  () => import("@/trip/page/TripSavedDetailPage"),
);

export const CommunityPage = lazy(() => import("@/board/pages/CommunityPage"));
export const BoardDetailPage = lazy(
  () => import("@/board/pages/BoardDetailPage"),
);
export const BoardWritePage = lazy(() => import("@/board/pages/BoardWritePage"));

export const MatchingPage = lazy(() => import("@/mate/pages/MatchingPage"));
export const MateWritePage = lazy(() => import("@/mate/pages/MateWritePage"));
export const MateDetailPage = lazy(() => import("@/mate/pages/MateDetailPage"));

export const NoticeListPage = lazy(() => import("@/home/NoticeListPage"));
export const NoticeDetailPage = lazy(() => import("@/home/NoticeDetailPage"));
export const FeedbackPage = lazy(() => import("@/home/FeedbackPage"));

export const CheckoutPage = lazy(() => import("@/payment/pages/CheckoutPage"));
export const PaymentCompletePage = lazy(
  () => import("@/payment/pages/PaymentCompletePage"),
);
export const CardRegisterPage = lazy(
  () => import("@/payment/pages/CardRegisterPage"),
);
export const BillingSuccessPage = lazy(
  () => import("@/payment/pages/BillingSuccessPage"),
);
export const BillingFailPage = lazy(
  () => import("@/payment/pages/BillingFailPage"),
);

export const ProfilePage = lazy(() => import("@/profile/ProfilePage"));
export const TripLogMainPage = lazy(
  () => import("@/travelog/page/TripLogMainPage"),
);
export const TripLogDetailPage = lazy(
  () => import("@/travelog/page/TripLogDetailPage"),
);
export const TripLogMapLayout = lazy(
  () => import("@/travelog/layout/TripLogMapLayout"),
);

export const AdminLayout = lazy(() => import("@/admin/pages/AdminLayout"));
export const AdminBannersPage = lazy(
  () => import("@/admin/pages/AdminBannersPage"),
);
export const AdminMainBackgroundsPage = lazy(
  () => import("@/admin/pages/AdminMainBackgroundsPage"),
);
export const AdminNoticesPage = lazy(
  () => import("@/admin/pages/AdminNoticesPage"),
);
export const AdminMonthlyDestinationsPage = lazy(
  () => import("@/admin/pages/AdminMonthlyDestinationsPage"),
);
export const AdminUsersPage = lazy(() => import("@/admin/pages/AdminUsersPage"));
export const AdminDashboardPage = lazy(
  () => import("@/admin/pages/AdminDashboardPage"),
);
export const AdminBoardPage = lazy(() => import("@/admin/pages/AdminBoardPage"));
export const AdminFeedbackPage = lazy(
  () => import("@/admin/pages/AdminFeedbackPage"),
);
