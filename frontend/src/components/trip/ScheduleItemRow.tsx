import type { ScheduleItem } from "@/api/trip";

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
  const selectedPlace = item.options[item.selectedOptionIndex];

  return (
    <li className="border-b border-outline-variant last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className="w-full py-stack-md text-left flex items-center justify-between gap-stack-md rounded-xl hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-stack-md min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
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
              {selectedPlace?.placeName ?? "선택된 후보 없음"}
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
