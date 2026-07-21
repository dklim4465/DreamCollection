import type { TravelerRequest } from "@/payment/api/paymentOrderApi";

export const MAX_TRAVELERS = 9;

export function emptyTraveler(representative: boolean): TravelerRequest {
  return {
    fullName: "",
    birthDate: "",
    gender: "M",
    passportNumber: "",
    passportExpiry: "",
    nationality: "",
    phone: "",
    representative,
  };
}

export function isTravelerValid(traveler: TravelerRequest): boolean {
  const baseOk =
    Boolean(traveler.fullName.trim()) &&
    Boolean(traveler.birthDate) &&
    Boolean(traveler.passportNumber.trim()) &&
    Boolean(traveler.passportExpiry) &&
    (traveler.gender === "M" || traveler.gender === "F");
  if (!baseOk) return false;
  if (traveler.representative && !traveler.phone?.trim()) return false;
  return true;
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

export function removeTraveler(
  prev: TravelerRequest[],
  index: number,
): TravelerRequest[] {
  const next = prev.filter((_, i) => i !== index);
  if (next.length === 0) return next;
  if (!next.some((t) => t.representative)) {
    next[0] = { ...next[0], representative: true };
  }
  return next;
}

export function upsertTraveler(
  prev: TravelerRequest[],
  traveler: TravelerRequest,
  editIndex: number | null,
): TravelerRequest[] {
  let next: TravelerRequest[];
  if (editIndex == null) {
    next = [...prev, traveler];
    if (traveler.representative) {
      next = next.map((t, i) =>
        i === next.length - 1 ? t : { ...t, representative: false },
      );
    }
  } else {
    next = patchTraveler(prev, editIndex, traveler);
  }

  if (next.length > 0 && !next.some((t) => t.representative)) {
    const promoteIndex =
      editIndex != null
        ? Math.max(
            0,
            next.findIndex((_, i) => i !== editIndex),
          )
        : 0;
    next = next.map((t, i) => ({
      ...t,
      representative: i === promoteIndex,
    }));
  }
  return next;
}

export function canSubmitCheckout(params: {
  savedTripId: number;
  cardId: number | null;
  travelers: TravelerRequest[];
  agreed: boolean;
}): boolean {
  const { savedTripId, cardId, travelers, agreed } = params;
  if (!savedTripId || Number.isNaN(savedTripId)) return false;
  if (cardId == null) return false;
  if (!agreed) return false;
  if (travelers.length < 1) return false;
  if (travelers.filter((t) => t.representative).length !== 1) return false;
  return travelers.every(isTravelerValid);
}

export function estimateCheckoutTotal(params: {
  flightPrice?: number | null;
  hotelPrice?: number | null;
  adultCount: number;
}): number | null {
  const { flightPrice, hotelPrice, adultCount } = params;
  const flightOk =
    flightPrice != null && !Number.isNaN(flightPrice) && flightPrice > 0;
  const hotelOk =
    hotelPrice != null && !Number.isNaN(hotelPrice) && hotelPrice > 0;
  if (!flightOk && !hotelOk) return null;

  let total = 0;
  if (flightOk) total += Math.round(flightPrice) * Math.max(0, adultCount);
  if (hotelOk) total += Math.round(hotelPrice);
  return total > 0 ? total : null;
}
