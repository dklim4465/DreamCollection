import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/auth/api/authApi";
import { useAuthStore } from "@/auth/store/authStore";
import LoadingSpinner from "@/common/components/LoadingSpinner";

/**
 * 카카오 로그인 동의 후 카카오가 리다이렉트하는 페이지.
 * URL의 ?code=... 를 읽어서 백엔드로 전달하고, 로그인 처리 후 홈으로 이동한다.
 * App.tsx 라우트: /oauth/callback/kakao
 * (카카오 개발자 콘솔의 Redirect URI 등록값과 반드시 동일해야 함)
 */
export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const kakaoError = searchParams.get("error");

    if (kakaoError) {
      setError("카카오 로그인이 취소되었습니다.");
      return;
    }
    if (!code) {
      setError("잘못된 접근입니다. 인가 코드가 없어요.");
      return;
    }
    if (requested.current) return; // React StrictMode 이중 호출 방지
    requested.current = true;

    authApi
      .loginWithKakaoCode(code)
      .then((res) => {
        const { accessToken, refreshToken, user } = res.data.data;
        setUser(user, accessToken, refreshToken);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ?? "카카오 로그인에 실패했습니다.";
        setError(message);
      });
  }, [searchParams, navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="card-base p-8 max-w-md w-full text-center">
          <p className="text-body-md text-error mb-6">{error}</p>
          <button className="btn-primary w-full" onClick={() => navigate("/login")}>
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <LoadingSpinner message="카카오 로그인 처리 중..." />;
}