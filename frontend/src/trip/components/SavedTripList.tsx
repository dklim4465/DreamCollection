import { useNavigate } from "react-router-dom";
import type { PlanResponse, SavedTrip } from "@/trip/api/trip";

interface Props {
  savedTrips: SavedTrip[];
}

export default function SavedTripList({ savedTrips }: Props) {
  const navigate = useNavigate();

  const handleOpen = (savedTrips: SavedTrip) => {
    const planResult: PlanResponse = {
      ...savedTrips.conditions,
      prompt: "",
      aiResult: "",
      recommendations: [savedTrips.recommendation],
      sideBlocks: [],
    };
    navigate("/trip/edit", {
      state: {
        conditions: savedTrips.conditions,
        planResult,
        recommendation: savedTrips.recommendation,
        savedTripId: savedTrips.savedTripId,
        isSavedView: true,
        saveLabel: "일정 수정",
      },
    });
  };

  //결과 보려고 이동했을때 아래 버튼 두개 숨기기

  return (
    <div className="grid gap-stack-md">
      {savedTrips.map((savedTrip) => (
        <button
          key={savedTrip.savedTripId}
          type="button"
          onClick={() => handleOpen(savedTrip)}
          className="card-interactive p-stack-lg text-left"
        >
          <div className="flex justify-between gap-stack-md">
            <div>
              <p className="text-label-md text-primary font-semibold">
                {savedTrip.conditions.region} · {savedTrip.conditions.when}
              </p>

              <h2 className="text-headline-sm font-bold mt-1">
                {savedTrip.recommendation.title}
              </h2>

              <p className="text-body-md text-on-surface-variant mt-2">
                {savedTrip.recommendation.summary}
              </p>
            </div>

            <span className="material-symbols-outlined text-primary">
              chevron_right
            </span>
          </div>

          <div className="flex flex-wrap gap-stack-sm mt-stack-md">
            <span className="chip-primary">{savedTrip.conditions.who}</span>
            <span className="chip-primary">{savedTrip.conditions.theme}</span>
            <span className="chip-primary">{savedTrip.conditions.level}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
