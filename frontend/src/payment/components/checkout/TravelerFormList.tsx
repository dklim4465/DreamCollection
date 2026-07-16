import type { TravelerRequest } from "@/payment/api/paymentOrderApi";
import TravelerFormCard from "./TravelerFormCard";

interface Props {
  travelers: TravelerRequest[];
  onChangeTraveler: (index: number, patch: Partial<TravelerRequest>) => void;
}

export default function TravelerFormList({
  travelers,
  onChangeTraveler,
}: Props) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title-md font-semibold">여행자 정보</h2>
      {travelers.map((traveler, index) => (
        <TravelerFormCard
          key={index}
          index={index}
          traveler={traveler}
          onChange={(patch) => onChangeTraveler(index, patch)}
        />
      ))}
    </section>
  );
}
