import type { PlaceOption } from "@/api/trip";

interface Props {
  options: PlaceOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

//여기는 결과 이후에 선택지를 고를 수 있게 하기 위한 컴포넌트
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
