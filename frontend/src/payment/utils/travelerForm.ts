import type { TravelerRequest } from "@/payment/api/paymentOrderApi";

export function emptyTraveler(representative: boolean): TravelerRequest {
  return {
    fullName: "",
    birthDate: "",
    gender: "M",
    passportNumber: "",
    passportExpiry: "",
    phone: representative ? "" : undefined,
    representative,
  };
}

export function resizeTravelers(
  prev: TravelerRequest[],
  adultCount: number,
): TravelerRequest[] {
  if (adultCount === prev.length) return prev;
  if (adultCount > prev.length) {
    const added = Array.from({ length: adultCount - prev.length }, () =>
      emptyTraveler(false),
    );
    return [...prev, ...added];
  }
  const next = prev.slice(0, adultCount);
  if (!next.some((t) => t.representative) && next[0]) {
    next[0] = { ...next[0], representative: true };
  }
  return next;
}

export function patchTraveler(
  prev: TravelerRequest[],
  index: number,
  patch: Partial<TravelerRequest>,
): TravelerRequest[] {
  return prev.map((t, i) => {
    if (i !== index) {
      if (patch.representative === true) {
        return { ...t, representative: false };
      }
      return t;
    }
    return { ...t, ...patch };
  });
}

export function canSubmitCheckout(params: {
  savedTripId: number;
  cardId: number | null;
  adultCount: number;
  travelers: TravelerRequest[];
}): boolean {
  const { savedTripId, cardId, adultCount, travelers } = params;
  if (!savedTripId || Number.isNaN(savedTripId)) return false;
  if (cardId == null) return false;
  if (travelers.length !== adultCount) return false;
  return travelers.every((t) => {
    const baseOk =
      t.fullName.trim() &&
      t.birthDate &&
      t.passportNumber.trim() &&
      t.passportExpiry;
    if (!baseOk) return false;
    if (t.representative && !t.phone?.trim()) return false;
    return true;
  });
}
