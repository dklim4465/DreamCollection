import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * 토스페이먼츠가 카드 등록 실패/취소 시 리다이렉트하는 페이지.
 */
export default function BillingFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get("message") || "카드 등록이 취소되었어요.";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md card-base p-8 flex flex-col items-center text-center gap-4">
        <span className="material-symbols-outlined text-error text-5xl">cancel</span>
        <h1 className="text-headline-md font-bold">카드 등록이 취소됐어요</h1>
        <p className="text-body-md text-on-surface-variant">{message}</p>
        <div className="flex gap-2 w-full mt-2">
          <button onClick={() => navigate("/register/card")} className="btn-ghost flex-1">
            다시 시도
          </button>
          <button onClick={() => navigate("/")} className="btn-primary flex-1">
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
