import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/auth/store/authStore";
import { requestCardBillingAuth } from "@/payment/api/tossPayments";
import { TOSS_CLIENT_KEY } from "@/payment/api/paymentCardApi";

/**
 * 회원가입 완료 후 진입하는 카드 등록(선택) 안내 페이지.
 * "카드 등록하기" 클릭 시 토스페이먼츠 위젯으로 이동 →
 * 카드 정보는 토스 서버로 직접 전송되고(우리 서버는 안 봄) →
 * 완료되면 /billing/success 로 리다이렉트되어 백엔드에 authKey 전달.
 */
export default function CardRegisterPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterCard = async () => {
    if (!user) return;
    setIsRequesting(true);
    setError(null);
    try {
      // customerKey는 반드시 로그인한 본인의 고유 id로 지정
      await requestCardBillingAuth(TOSS_CLIENT_KEY, String(user.id));
      // 성공 시 토스가 successUrl로 리다이렉트하므로 여기 이후 코드는 보통 실행되지 않음
    } catch (e) {
      setError(e instanceof Error ? e.message : "카드 등록 창을 여는 데 실패했습니다.");
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md card-base p-8 flex flex-col items-center text-center gap-4">
        <span className="material-symbols-outlined text-primary text-5xl">
          credit_card
        </span>
        <h1 className="text-headline-md font-bold">가입을 축하해요!</h1>
        <p className="text-body-md text-on-surface-variant">
          결제카드를 미리 등록해두면 다음에 예약할 때 훨씬 빨라져요.
          <br />
          지금 등록하지 않아도 나중에 마이페이지에서 언제든 추가할 수 있어요.
        </p>

        {error && <p className="text-label-sm text-error">{error}</p>}

        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            onClick={handleRegisterCard}
            disabled={isRequesting}
            className="btn-primary w-full"
          >
            {isRequesting ? "이동 중..." : "카드 등록하기"}
          </button>
          <button onClick={() => navigate("/")} className="btn-ghost w-full">
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
