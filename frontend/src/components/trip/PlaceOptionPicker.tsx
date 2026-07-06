import type { PlaceOption } from "@/api/trip";

interface Props {
  options: PlaceOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * ScheduleItem 하나에 붙는 "장소 후보 선택" UI
 * - options: 백엔드가 내려준 후보 3개
 * - selectedIndex: selectedOptionIndex 와 같은 값
 * - onSelect: 클릭한 후보의 index(0,1,2)를 부모로 전달
 */
export default function PlaceOptionPicker({
  options,
  selectedIndex,
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-sm">
      {options.map((place, index) => {
        const selected = selectedIndex === index;

        return (
          <button
            key={place.option}
            type="button"
            onClick={() => onSelect(index)}
            className={
              selected
                ? "text-left p-stack-md rounded-2xl bg-primary text-on-primary transition-colors"
                : "text-left p-stack-md rounded-2xl bg-surface-container-low hover:bg-primary-container transition-colors"
            }
          >
            <p className="text-label-md font-bold">{place.placeName}</p>
            <p
              className={`text-label-sm mt-1 ${
                selected ? "text-on-primary/80" : "text-on-surface-variant"
              }`}
            >
              {place.category}
            </p>
            <p
              className={`text-label-sm mt-2 line-clamp-2 ${
                selected ? "text-on-primary/90" : "text-on-surface-variant"
              }`}
            >
              {place.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
