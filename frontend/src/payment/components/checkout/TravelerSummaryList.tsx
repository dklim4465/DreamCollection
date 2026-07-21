import type { TravelerRequest } from "@/payment/api/paymentOrderApi";
import { MAX_TRAVELERS } from "@/payment/utils/travelerForm";

interface Props {
  travelers: TravelerRequest[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function TravelerSummaryList({
  travelers,
  onAdd,
  onEdit,
  onRemove,
}: Props) {
  const canAdd = travelers.length < MAX_TRAVELERS;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md font-semibold">여행자 정보</h2>
        <span className="text-label-sm text-on-surface-variant">
          성인 {travelers.length}명
        </span>
      </div>

      {travelers.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">
          여행자 정보를 추가해 주세요. 첫 번째 여행자가 대표로 설정됩니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {travelers.map((traveler, index) => (
            <li key={`${traveler.fullName}-${index}`} className="card-base p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-body-md truncate">
                      {traveler.fullName}
                    </p>
                    {traveler.representative && (
                      <span className="chip bg-primary/10 text-primary">
                        대표
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {traveler.gender === "M" ? "남" : "여"}
                    {traveler.birthDate ? ` · ${traveler.birthDate}` : ""}
                    {traveler.nationality?.trim()
                      ? ` · ${traveler.nationality.trim()}`
                      : ""}
                  </p>
                  {traveler.phone?.trim() && (
                    <p className="mt-0.5 text-label-sm text-on-surface-variant">
                      {traveler.phone}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-label-sm"
                    onClick={() => onEdit(index)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-label-sm text-error border-error"
                    onClick={() => onRemove(index)}
                    aria-label={`${traveler.fullName} 삭제`}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn-ghost w-full disabled:opacity-50"
        disabled={!canAdd}
        onClick={onAdd}
      >
        + 인원추가
      </button>
    </section>
  );
}
