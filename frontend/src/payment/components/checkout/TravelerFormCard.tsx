import type { TravelerRequest } from "@/payment/api/paymentOrderApi";

interface Props {
  index: number;
  traveler: TravelerRequest;
  onChange: (patch: Partial<TravelerRequest>) => void;
}

export default function TravelerFormCard({ index, traveler, onChange }: Props) {
  return (
    <div className="card-base p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">여행자 {index + 1}</span>
        <label className="flex items-center gap-2 text-label-sm">
          <input
            type="radio"
            name="representative"
            checked={traveler.representative}
            onChange={() => onChange({ representative: true })}
          />
          대표
        </label>
      </div>
      <input
        className="input-base"
        placeholder="이름"
        value={traveler.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input-base"
          type="date"
          value={traveler.birthDate}
          onChange={(e) => onChange({ birthDate: e.target.value })}
        />
        <select
          className="input-base"
          value={traveler.gender}
          onChange={(e) => onChange({ gender: e.target.value as "M" | "F" })}
        >
          <option value="M">남</option>
          <option value="F">여</option>
        </select>
      </div>
      <input
        className="input-base"
        placeholder="여권번호"
        value={traveler.passportNumber}
        onChange={(e) => onChange({ passportNumber: e.target.value })}
      />
      <input
        className="input-base"
        type="date"
        value={traveler.passportExpiry}
        onChange={(e) => onChange({ passportExpiry: e.target.value })}
      />
      {traveler.representative && (
        <input
          className="input-base"
          placeholder="대표 연락처"
          value={traveler.phone ?? ""}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      )}
    </div>
  );
}
