import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import { useAuthStore } from "@/auth/store/authStore";
import { paymentCardApi } from "@/payment/api/paymentCardApi";
import { paymentOrderApi } from "@/payment/api/paymentOrderApi";
import type { TravelerRequest } from "@/payment/api/paymentOrderApi";
import CheckoutOrderSummary from "@/payment/components/checkout/CheckoutOrderSummary";
import CheckoutPaymentSidebar from "@/payment/components/checkout/CheckoutPaymentSidebar";
import PaymentCardSelect from "@/payment/components/checkout/PaymentCardSelect";
import TravelerFormModal from "@/payment/components/checkout/TravelerFormModal";
import TravelerSummaryList from "@/payment/components/checkout/TravelerSummaryList";
import {
  canSubmitCheckout,
  estimateCheckoutTotal,
  removeTraveler,
  upsertTraveler,
} from "@/payment/utils/travelerForm";
import { tripApi } from "@/trip/api/trip";

interface CheckoutLocationState {
  savedTripId?: number;
}

type ModalState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; index: number };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const state = location.state as CheckoutLocationState | null;
  const savedTripId = Number(
    state?.savedTripId ?? searchParams.get("savedTripId") ?? "",
  );

  const [travelers, setTravelers] = useState<TravelerRequest[]>([]);
  const [cardId, setCardId] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });

  const adultCount = travelers.length;

  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ["paymentCards"],
    queryFn: paymentCardApi.getMyCards,
  });
  const cards = cardsData?.data?.data ?? [];

  const {
    data: trip,
    isLoading: tripLoading,
  } = useQuery({
    queryKey: ["savedTrip", savedTripId],
    queryFn: () => tripApi.getSavedTrip(savedTripId),
    enabled: Number.isInteger(savedTripId) && savedTripId > 0,
  });

  useEffect(() => {
    if (cardId != null || cards.length === 0) return;
    const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];
    setCardId(defaultCard.id);
  }, [cards, cardId]);

  const estimatedTotal = useMemo(() => {
    if (!trip) return null;
    const flight = trip.flightSelection;
    const hotel = trip.accommodationSelection;
    return estimateCheckoutTotal({
      flightPrice:
        flight && !flight.skipped && flight.price != null && flight.price > 0
          ? flight.price
          : null,
      hotelPrice:
        hotel && !hotel.skipped && hotel.price != null && hotel.price > 0
          ? hotel.price
          : null,
      adultCount,
    });
  }, [trip, adultCount]);

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!savedTripId || Number.isNaN(savedTripId)) {
        throw new Error("결제할 일정이 없습니다.");
      }
      if (cardId == null) throw new Error("결제 카드를 선택해 주세요.");
      if (travelers.length < 1) {
        throw new Error("여행자 정보를 추가해 주세요.");
      }

      const created = await paymentOrderApi.createOrder({
        savedTripId,
        adultCount: travelers.length,
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
    () =>
      canSubmitCheckout({
        savedTripId,
        cardId,
        travelers,
        agreed,
      }),
    [savedTripId, cardId, travelers, agreed],
  );

  const prefill = useMemo(
    () => ({
      fullName: user?.name,
      phone: user?.phone,
    }),
    [user?.name, user?.phone],
  );

  const handlePay = () => {
    setError(null);
    payMutation.mutate();
  };

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

  const isFirstTravelerAdd = !modal.open
    ? travelers.length === 0
    : modal.mode === "add" && travelers.length === 0;

  const showRepresentativeToggle =
    modal.open &&
    (modal.mode === "add"
      ? travelers.length >= 1
      : travelers.length > 1);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-headline-md font-bold">결제</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          여행자 정보와 결제 수단을 확인한 뒤 결제해 주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-8 min-w-0">
          <CheckoutOrderSummary
            trip={trip}
            adultCount={adultCount}
            isLoading={tripLoading}
          />

          <TravelerSummaryList
            travelers={travelers}
            onAdd={() => setModal({ open: true, mode: "add" })}
            onEdit={(index) => setModal({ open: true, mode: "edit", index })}
            onRemove={(index) =>
              setTravelers((prev) => removeTraveler(prev, index))
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

          <label className="flex items-start gap-3 text-body-md">
            <input
              type="checkbox"
              className="mt-1"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>아래 내용에 모두 동의합니다</span>
          </label>

          {error && <p className="text-label-sm text-error">{error}</p>}

          {/* 모바일: 사이드바 아래에도 CTA */}
          <div className="lg:hidden">
            <CheckoutPaymentSidebar
              estimatedTotal={estimatedTotal}
              adultCount={adultCount}
              canSubmit={canSubmit}
              isPaying={payMutation.isPending}
              onPay={handlePay}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <CheckoutPaymentSidebar
            estimatedTotal={estimatedTotal}
            adultCount={adultCount}
            canSubmit={canSubmit}
            isPaying={payMutation.isPending}
            onPay={handlePay}
          />
        </div>
      </div>

      {modal.open && (
        <TravelerFormModal
          key={
            modal.mode === "edit"
              ? `edit-${modal.index}`
              : `add-${travelers.length}`
          }
          mode={modal.mode}
          initial={
            modal.mode === "edit" ? travelers[modal.index] : undefined
          }
          isFirstTraveler={isFirstTravelerAdd}
          showRepresentativeToggle={showRepresentativeToggle}
          prefill={isFirstTravelerAdd ? prefill : undefined}
          onClose={() => setModal({ open: false })}
          onSubmit={(traveler) => {
            setTravelers((prev) =>
              upsertTraveler(
                prev,
                traveler,
                modal.mode === "edit" ? modal.index : null,
              ),
            );
            setModal({ open: false });
          }}
        />
      )}
    </div>
  );
}
