import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EmptyState from "@/common/component/EmptyState";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import { cartApi } from "@/payment/api/cartApi";
import { paymentApi } from "@/payment/api/paymentApi";
import type { PaymentMethod } from "@/types";

/**
 * 장바구니 + 결제 페이지
 * TODO: 실제 PG(토스페이먼츠/아임포트 등) 연동, 수량/옵션 변경
 */
export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [paidResult, setPaidResult] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getItems,
  });

  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const items = data?.data?.data ?? [];
  const total = items.reduce((sum, i) => sum + i.price, 0);

  const checkoutMutation = useMutation({
    mutationFn: () => paymentApi.checkout(items, method),
    onSuccess: (res) => {
      setPaidResult(res.data.data.reduce((sum, p) => sum + p.amount, 0));
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["travelPlans"] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  // 결제 완료 화면
  if (paidResult !== null) {
    return (
      <div className="max-w-md mx-auto text-center py-16 flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-primary text-6xl">
          check_circle
        </span>
        <h1 className="text-headline-md font-bold">결제가 완료되었어요!</h1>
        <p className="text-body-md text-on-surface-variant">
          {paidResult.toLocaleString("ko-KR")}원 결제가 정상 처리되었습니다
        </p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate("/trip")} className="btn-ghost">
            내 일정 보기
          </button>
          <button onClick={() => navigate("/profile")} className="btn-primary">
            마이페이지에서 확인
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="장바구니가 비어있어요"
        description="여행 계획에서 원하는 일정을 장바구니에 담아보세요"
        action={
          <button onClick={() => navigate("/trip")} className="btn-primary">
            내 일정 보러가기
          </button>
        }
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-stack-lg">
      <h1 className="text-headline-md font-bold">장바구니</h1>

      <div className="card-base flex flex-col divide-y divide-outline-variant">
        {items.map((item) => (
          <div key={item.id} className="p-stack-lg flex items-center justify-between gap-3">
            <div>
              <h3 className="text-headline-sm font-bold">{item.scheduleTitle}</h3>
              <p className="text-label-md text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {item.destination}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-headline-sm font-bold">
                {item.price.toLocaleString("ko-KR")}원
              </span>
              <button
                onClick={() => removeMutation.mutate(item.id)}
                className="text-on-surface-variant hover:text-error"
                aria-label="삭제"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card-base p-stack-lg flex flex-col gap-4">
        <h3 className="text-headline-sm font-bold">결제 수단</h3>
        <div className="flex gap-3">
          {(["CARD", "EASY_PAY"] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={
                method === m
                  ? "flex-1 rounded-xl border-2 border-primary bg-primary-container p-4 text-center font-bold"
                  : "flex-1 rounded-xl border-2 border-outline-variant p-4 text-center text-on-surface-variant"
              }
            >
              {m === "CARD" ? "카드 결제" : "간편 결제"}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
          <span className="text-body-md text-on-surface-variant">총 결제 금액</span>
          <span className="text-headline-md font-bold text-primary">
            {total.toLocaleString("ko-KR")}원
          </span>
        </div>

        <button
          onClick={() => checkoutMutation.mutate()}
          className="btn-primary w-full"
          disabled={checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? "결제 처리 중..." : `${total.toLocaleString("ko-KR")}원 결제하기`}
        </button>
      </div>
    </div>
  );
}
