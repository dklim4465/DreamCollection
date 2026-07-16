import type { PaymentOrderResponse } from "@/payment/api/paymentOrderApi";

interface Props {
  order: PaymentOrderResponse;
  onGoTrips: () => void;
  onGoProfile: () => void;
}

export default function PaymentCompleteView({
  order,
  onGoTrips,
  onGoProfile,
}: Props) {
  return (
    <div className="max-w-md mx-auto text-center py-16 flex flex-col items-center gap-4">
      <span className="material-symbols-outlined text-primary text-6xl">
        check_circle
      </span>
      <h1 className="text-headline-md font-bold">결제가 완료되었어요!</h1>
      <p className="text-body-md text-on-surface-variant">
        {order.totalAmount.toLocaleString("ko-KR")}원 결제가 정상 처리되었습니다
      </p>
      <p className="text-label-sm text-on-surface-variant">
        주문번호 {order.orderId}
      </p>
      <div className="flex gap-3 mt-4">
        <button onClick={onGoTrips} className="btn-ghost">
          내 일정 보기
        </button>
        <button onClick={onGoProfile} className="btn-primary">
          마이페이지에서 확인
        </button>
      </div>
    </div>
  );
}
