import { useState } from "react";
import PlaceSuggestionList, {
  type PlaceSuggestionTab,
} from "@/trip/components/place/PlaceSuggestionList";
import CustomSuggestionList from "./CustomSuggestionList";
import type { SuggestionTab } from "./types";

interface Props {
  city: string;
  onDragEnd: () => void;
}

const SUGGESTION_TABS: Array<{
  key: SuggestionTab;
  label: string;
}> = [
  { key: "schedule", label: "추천 일정" },
  { key: "meal", label: "맛집" },
  { key: "experience", label: "체험" },
  { key: "custom", label: "직접 추가" },
];

const isPlaceSuggestionTab = (
  tab: SuggestionTab,
): tab is PlaceSuggestionTab => {
  return tab !== "custom";
};

export default function TripSuggestionPanel({ city, onDragEnd }: Props) {
  const [activeTab, setActiveTab] = useState<SuggestionTab>("schedule");

  return (
    <aside className="trip-surface flex max-h-[70vh] min-h-0 flex-col xl:max-h-[680px]">
      <div className="flex items-center justify-between border-b border-outline-variant/50 px-stack-md py-stack-sm">
        <h3 className="text-body-md font-bold text-on-surface">
          맞춤 추천 제안
        </h3>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-label-md text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          닫기
        </button>
      </div>

      <div className="grid grid-cols-2 border-b border-outline-variant/50 bg-surface-container-low px-stack-sm text-center text-label-sm font-bold text-on-surface-variant">
        {SUGGESTION_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={
              activeTab === tab.key
                ? "border-b-2 border-primary px-2 py-2.5 text-primary"
                : "border-b-2 border-transparent px-2 py-2.5 transition-colors hover:text-on-surface"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPlaceSuggestionTab(activeTab) ? (
          <div className="px-stack-sm">
            <PlaceSuggestionList
              city={city}
              tab={activeTab}
              onDragEnd={onDragEnd}
            />
          </div>
        ) : (
          <CustomSuggestionList onDragEnd={onDragEnd} />
        )}
      </div>

      <button
        type="button"
        className="w-full border-t border-outline-variant/50 px-4 py-3 text-label-md font-bold text-primary transition-colors hover:bg-primary/5"
      >
        추천 일정 더 보기
        <span className="material-symbols-outlined ml-1 align-[-4px] text-[18px]">
          arrow_forward
        </span>
      </button>
    </aside>
  );
}
