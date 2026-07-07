import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import PrivateRoute from "@/components/common/PrivateRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TripResultPage from "@/pages/Trip/TripResultPage";
import TripHubPage from "@/pages/Trip/TripHubPage";
import TripSavedListPage from "@/pages/Trip/TripSavedListPage";

const HomePage = lazy(() => import("@/pages/HomePage"));
const CommunityPage = lazy(() => import("@/pages/board/CommunityPage"));
const BoardDetailPage = lazy(() => import("@/pages/board/BoardDetailPage"));
const BoardWritePage = lazy(() => import("@/pages/board/BoardWritePage"));
const MatchingPage = lazy(() => import("@/pages/MatchingPage"));
const TravelPlanPage = lazy(() => import("@/pages/Trip/TravelPlanPage"));
const RecordsPage = lazy(() => import("@/pages/RecordsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner message="페이지 로딩 중..." />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/:postId" element={<BoardDetailPage />} />
              <Route path="/matching" element={<MatchingPage />} />

              <Route element={<PrivateRoute />}>
                <Route path="/community/new" element={<BoardWritePage />} />
                <Route
                  path="/community/:postId/edit"
                  element={<BoardWritePage />}
                />
                <Route path="/trip" element={<TripHubPage />} />
                <Route path="/trip/new" element={<TravelPlanPage />} />
                <Route path="/trip/result" element={<TripResultPage />} />
                <Route path="/trip/saved" element={<TripSavedListPage />} />
                <Route path="/records" element={<RecordsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
