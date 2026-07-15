import type { ScheduleItem } from "@/trip/api/trip";

const TIME_SLOT_LABEL: Record<string, string> = {
  Morning: "오전",
  Lunch: "점심",
  Afternoon: "오후",
  Dinner: "저녁",
};

interface Props {
  item: ScheduleItem;
  onOpen: () => void;
}

export default function ScheduleItemRow({ item, onOpen }: Props) {
  return (
    <li className="border-b border-outline-variant/50 last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between gap-stack-md rounded-xl px-stack-sm py-stack-md text-left transition-colors hover:bg-surface-container-low"
      >
        <div className="flex items-center gap-stack-md min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined">
              {item.itemType === "Meal" ? "restaurant" : "location_on"}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-stack-sm mb-1">
              <span className="chip bg-surface-container-high text-on-surface-variant">
                {TIME_SLOT_LABEL[item.timeSlot] ?? item.timeSlot}
              </span>

              <span className="text-label-sm text-on-surface-variant">
                {item.itemType}
              </span>
            </div>

            <h4 className="text-body-md font-bold truncate">{item.title}</h4>

            <p className="text-label-md text-on-surface-variant truncate mt-1">
              {item.description ?? item.address ?? "상세 정보 없음"}
            </p>
          </div>
        </div>

        <span className="material-symbols-outlined text-primary shrink-0">
          chevron_right
        </span>
      </button>
    </li>
  );
}
