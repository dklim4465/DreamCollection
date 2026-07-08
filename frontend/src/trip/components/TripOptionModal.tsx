import type { DayPlan, ScheduleItem } from "@/trip/api/trip";

interface Props {
  day: DayPlan;
  item: ScheduleItem;
  onClose: () => void;
  onSelect: (optionIndex: number) => void;
}

const TIME_SLOT_LABEL: Record<string, string> = {
  Morning: "오전",
  Lunch: "점심",
  Afternoon: "오후",
  Dinner: "저녁",
};

export default function TripOptionModal({
  day,
  item,
  onClose,
  onSelect,
}: Props) {
  const selectedPlace = item.options[item.selectedOptionIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end md:items-center justify-center p-4">
      <section className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl traveler-glow">
        <div className="p-stack-lg border-b border-outline-variant">
          <div className="flex items-start justify-between gap-stack-md">
            <div>
              <span className="chip-primary">
                {day.dayTitle} ·{" "}
                {TIME_SLOT_LABEL[item.timeSlot] ?? item.timeSlot}
              </span>

              <h2 className="text-headline-md font-bold mt-3">{item.title}</h2>

              <p className="text-body-md text-on-surface-variant mt-1">
                후보 3가지를 비교하고 마음에 드는 일정으로 변경하세요.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors shrink-0"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {selectedPlace && (
            <div className="mt-stack-md rounded-2xl bg-primary-container text-on-primary-container p-stack-md">
              <p className="text-label-md font-semibold">현재 선택</p>
              <p className="text-headline-sm font-bold mt-1">
                {selectedPlace.placeName}
              </p>
            </div>
          )}
        </div>

        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-gutter p-stack-lg">
          {item.options.map((place, optionIndex) => {
            const selected = item.selectedOptionIndex === optionIndex;

            return (
              <button
                key={place.option}
                type="button"
                onClick={() => onSelect(optionIndex)}
                className={[
                  "snap-start shrink-0 w-[82%] sm:w-[360px] rounded-2xl p-stack-lg text-left transition-all",
                  selected
                    ? "bg-primary text-on-primary traveler-glow"
                    : "bg-surface-container-low hover:bg-primary-container text-on-surface",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-stack-sm">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      {item.itemType === "Meal" ? "restaurant" : "location_on"}
                    </span>
                  </div>

                  {selected && (
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                  )}
                </div>

                <p className="text-label-md mt-stack-lg opacity-80">
                  후보 {place.option}
                </p>

                <h3 className="text-headline-sm font-bold mt-1">
                  {place.placeName}
                </h3>

                <p className="text-label-md mt-2 opacity-80">
                  {place.category}
                </p>

                <p className="text-body-md mt-stack-md leading-relaxed opacity-90">
                  {place.description}
                </p>

                <div className="mt-stack-lg">
                  <span
                    className={
                      selected
                        ? "inline-flex px-4 py-2 rounded-full bg-white text-primary text-label-md font-bold"
                        : "inline-flex px-4 py-2 rounded-full bg-primary text-on-primary text-label-md font-bold"
                    }
                  >
                    {selected ? "현재 선택됨" : "이 후보로 변경"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
