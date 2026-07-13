import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentCardApi } from "@/payment/api/paymentCardApi";

/**
 * 토스페이먼츠가 카드 등록 성공 시 리다이렉트하는 페이지.
 * URL 쿼리로 authKey, customerKey를 넘겨주며, 이걸 백엔드로 전달해
 * 실제 빌링키로 교환 + 저장을 완료합니다.
 *
 * 저장이 끝나면 "일정 짜러 가시겠습니까?" 확인창을 보여주고,
 * 예 → /trip/new (일정 만들기), 아니요 → /profile (마이페이지)로 이동.
 * 카드는 이미 이 시점에 저장 완료된 상태라 어느 쪽을 눌러도 카드는 그대로 남아있음.
 */
export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "done" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const authKey = searchParams.get("authKey");
    const customerKey = searchParams.get("customerKey");

    if (!authKey || !customerKey) {
      setStatus("error");
      setErrorMessage("필요한 정보가 없어요. 다시 시도해주세요.");
      return;
    }

    paymentCardApi
      .registerCard(authKey, customerKey)
      .then(() => setStatus("done"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err?.response?.data?.message || "카드 등록 처리 중 오류가 발생했어요.",
        );
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md card-base p-8 flex flex-col items-center text-center gap-4">
        {status === "processing" && (
          <>
            <div className="w-9 h-9 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
            <p className="text-body-md text-on-surface-variant">카드 등록 처리 중이에요...</p>
          </>
        )}

        {status === "done" && (
          <>
            <span className="material-symbols-outlined text-primary text-5xl">
              check_circle
            </span>
            <h1 className="text-headline-md font-bold">카드 등록이 완료되었습니다</h1>
            <p className="text-body-md text-on-surface-variant">
              바로 일정을 짜러 가시겠어요?
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => navigate("/profile")}
                className="btn-ghost flex-1"
              >
                아니요, 마이페이지로
              </button>
              <button
                onClick={() => navigate("/trip/new")}
                className="btn-primary flex-1"
              >
                예, 일정 짜러 가기
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <span className="material-symbols-outlined text-error text-5xl">error</span>
            <h1 className="text-headline-md font-bold">등록에 실패했어요</h1>
            <p className="text-label-sm text-error">{errorMessage}</p>
            <div className="flex gap-2 w-full mt-2">
              <button onClick={() => navigate("/profile")} className="btn-ghost flex-1">
                다시 시도
              </button>
              <button onClick={() => navigate("/")} className="btn-primary flex-1">
                건너뛰기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}