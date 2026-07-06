import type { ScheduleItem } from "@/api/trip";
import PlaceOptionPicker from "./PlaceOptionPicker";

// 백엔드에서 시간 별로 나눠서 받아오는곳 (임시 세팅)
const TIME_SLOT_LABEL: Record<string, string> = {
  Morning: "오전",
  Lunch: "점심",
  Afternoon: "오후",
  Dinner: "저녁",
};

interface Props {
  item: ScheduleItem;
  onSelectOption: (optionIndex: number) => void;
}

// 일정을 한줄로 받아오는 곳(결과 창)
export default function ScheduleItemRow({ item, onSelectOption }: Props) {
  const selectedPlace = item.options[item.selectedOptionIndex];

  return (
    <li className="py-stack-md border-b border-outline-variant last:border-b-0">
      {/* 시간대 + 제목 */}
      <div className="flex items-start justify-between gap-stack-sm mb-stack-sm">
        <div className="flex items-center gap-stack-sm min-w-0">
          <span className="chip bg-primary-container text-on-primary-container shrink-0">
            {TIME_SLOT_LABEL[item.timeSlot] ?? item.timeSlot}
          </span>
          <h4 className="text-headline-sm font-bold truncate">{item.title}</h4>
        </div>
        {selectedPlace && (
          <span className="text-label-sm text-on-surface-variant shrink-0">
            {selectedPlace.placeName}
          </span>
        )}
      </div>

      {/* 교체 가능한 후보 받아오는 곳 */}
      {item.replaceable && (
        <PlaceOptionPicker
          options={item.options}
          selectedIndex={item.selectedOptionIndex}
          onSelect={onSelectOption}
        />
      )}
    </li>
  );
}
