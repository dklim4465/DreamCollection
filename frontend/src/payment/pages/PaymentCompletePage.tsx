import { useLocation, useNavigate } from "react-router-dom";
import type { PaymentOrderResponse } from "@/payment/api/paymentOrderApi";
import PaymentCompleteView from "@/payment/components/complete/PaymentCompleteView";

interface CompleteState {
  order?: PaymentOrderResponse;
}

export default function PaymentCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as CompleteState | null)?.order;

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center flex flex-col gap-4">
        <h1 className="text-headline-md font-bold">결제 정보가 없어요</h1>
        <button onClick={() => navigate("/trip/saved")} className="btn-primary">
          저장된 일정으로
        </button>
      </div>
    );
  }

  return (
    <PaymentCompleteView
      order={order}
      onGoTrips={() => navigate("/trip/saved")}
      onGoProfile={() => navigate("/profile")}
    />
  );
}
