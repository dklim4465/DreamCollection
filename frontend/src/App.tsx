import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ── 코드 스플리팅 (lazy import) ──────────────────────────────

// TODO: 아래 페이지는 각 팀원이 추가
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
