import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import { paymentCardApi } from "@/payment/api/paymentCardApi";
import {
  paymentOrderApi,
  type TravelerRequest,
} from "@/payment/api/paymentOrderApi";
import AdultCountField from "@/payment/components/checkout/AdultCountField";
import TravelerFormList from "@/payment/components/checkout/TravelerFormList";
import PaymentCardSelect from "@/payment/components/checkout/PaymentCardSelect";
import {
  canSubmitCheckout,
  emptyTraveler,
  patchTraveler,
  resizeTravelers,
} from "@/payment/utils/travelerForm";

interface CheckoutLocationState {
  savedTripId?: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as CheckoutLocationState | null;
  const savedTripId = Number(
    state?.savedTripId ?? searchParams.get("savedTripId") ?? "",
  );

  const [adultCount, setAdultCount] = useState(1);
  const [travelers, setTravelers] = useState<TravelerRequest[]>([
    emptyTraveler(true),
  ]);
  const [cardId, setCardId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ["paymentCards"],
    queryFn: paymentCardApi.getMyCards,
  });
  const cards = cardsData?.data?.data ?? [];

  useEffect(() => {
    if (cardId != null || cards.length === 0) return;
    const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];
    setCardId(defaultCard.id);
  }, [cards, cardId]);

  useEffect(() => {
    setTravelers((prev) => resizeTravelers(prev, adultCount));
  }, [adultCount]);

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!savedTripId || Number.isNaN(savedTripId)) {
        throw new Error("결제할 일정이 없습니다.");
      }
      if (cardId == null) throw new Error("결제 카드를 선택해 주세요.");

      const created = await paymentOrderApi.createOrder({
        savedTripId,
        adultCount,
        travelers,
      });
      const confirmed = await paymentOrderApi.confirmOrder(
        created.data.data.orderId,
        { cardId },
      );
      return confirmed.data.data;
    },
    onSuccess: (order) => {
      if (order.status === "PAID") {
        navigate("/payment/complete", { state: { order } });
        return;
      }
      setError(order.failReason ?? "결제에 실패했습니다.");
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (e instanceof Error ? e.message : "결제 처리 중 오류가 발생했습니다.");
      setError(msg);
    },
  });

  const canSubmit = useMemo(
    () => canSubmitCheckout({ savedTripId, cardId, adultCount, travelers }),
    [savedTripId, cardId, adultCount, travelers],
  );

  if (!savedTripId || Number.isNaN(savedTripId)) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center flex flex-col gap-4">
        <h1 className="text-headline-md font-bold">결제할 일정이 없어요</h1>
        <button onClick={() => navigate("/trip/saved")} className="btn-primary">
          저장된 일정으로
        </button>
      </div>
    );
  }

  if (cardsLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div>
        <h1 className="text-headline-md font-bold">결제</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          일정 #{savedTripId} · 여행자 정보와 카드를 확인한 뒤 결제해 주세요.
        </p>
      </div>

      <AdultCountField adultCount={adultCount} onChange={setAdultCount} />
      <TravelerFormList
        travelers={travelers}
        onChangeTraveler={(index, patch) =>
          setTravelers((prev) => patchTraveler(prev, index, patch))
        }
      />
      <PaymentCardSelect
        cards={cards}
        cardId={cardId}
        onSelect={setCardId}
        onRegisterOther={() =>
          navigate("/register/card", {
            state: {
              returnTo: `/payment/checkout?savedTripId=${savedTripId}`,
            },
          })
        }
      />

      {error && <p className="text-label-sm text-error">{error}</p>}

      <button
        type="button"
        className="btn-primary w-full"
        disabled={!canSubmit || payMutation.isPending}
        onClick={() => {
          setError(null);
          payMutation.mutate();
        }}
      >
        {payMutation.isPending ? "결제 중..." : "결제하기"}
      </button>
    </div>
  );
}
