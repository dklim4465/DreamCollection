import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  tripApi,
  tripOptionIcons,
  tripOptionLabels,
  tripOptionTypes,
  type FlightCondition,
  type PlanRequest,
  type TripFlowState,
  type TripOptionType,
} from "@/trip/api/trip";
import DestinationSelector from "@/trip/components/DestinationSelector";

type FlightPrepareType = "recommend" | "booked";
type AccommodationPrepareType = "recommend" | "booked";
type FlightPriority = NonNullable<FlightCondition["priority"]>;
type ActiveConditionType = TripOptionType | "destination" | null;

const BASIC_QUESTIONS: Record<TripOptionType, string> = {
  who: "누구와 함께 여행하시나요?",
  when: "여행 기간은 어떻게 되나요?",
  theme: "어떤 테마를 원하시나요?",
  level: "어떤 여행 스타일을 선호하시나요?",
};

const PREPARE_OPTIONS = {
  flight: [
    {
      value: "recommend",
      icon: "thumb_up",
      title: "추천 받기",
      description: "최적의 항공편을 추천해드려요.",
    },
    {
      value: "booked",
      icon: "confirmation_number",
      title: "이미 예약함",
      description: "이미 예약한 항공편이 있어요.",
    },
  ],
  accommodation: [
    {
      value: "recommend",
      icon: "thumb_up",
      title: "추천 받기",
      description: "여행지에 맞는 숙소를 추천해드려요.",
    },
    {
      value: "booked",
      icon: "apartment",
      title: "이미 예약함",
      description: "이미 예약한 숙소가 있어요.",
    },
  ],
} as const;

export default function TravelPlanPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<ActiveConditionType>("who");
  const [conditions, setConditions] = useState<Partial<PlanRequest>>({});
  const [flightPrepare, setFlightPrepare] =
    useState<FlightPrepareType>("recommend");
  const [flightPriority, setFlightPriority] = useState<FlightPriority>("PRICE");
  const [accommodationPrepare, setAccommodationPrepare] =
    useState<AccommodationPrepareType>("recommend");

  const isReady =
    tripOptionTypes.every((type) => conditions[type]) &&
    !!conditions.region &&
    !!conditions.destination;

  const handleSelect = (type: TripOptionType, selected: string) => {
    setConditions((prev) => ({ ...prev, [type]: selected }));

    if (type === "when") {
      setActiveType("destination");
      return;
    }

    const nextIndex = tripOptionTypes.indexOf(type) + 1;
    if (nextIndex < tripOptionTypes.length) {
      setActiveType(tripOptionTypes[nextIndex]);
    }
  };

  const handleToggle = (type: ActiveConditionType) => {
    setActiveType((prev) => (prev === type ? null : type));
  };

  const handleSubmit = () => {
    if (!isReady) return;

    const request: PlanRequest = {
      ...(conditions as PlanRequest),
      flightCondition:
        flightPrepare === "recommend"
          ? {
              skip: false,
              priority: flightPriority,
              seatClass: "ECONOMY",
              directOnly: false,
            }
          : {
              skip: true,
            },
      accommodationCondition:
        accommodationPrepare === "recommend"
          ? {
              skip: false,
            }
          : {
              skip: true,
            },
    };

    const flowState: TripFlowState = {
      conditions: request,
    };

    navigate("/trip/flight", { state: flowState });
  };

  return (
    <div className="space-y-stack-md">
      <div className="grid gap-stack-md xl:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.75fr)]">
        <section className="card-base border border-outline-variant/60 p-stack-lg">
          <div className="flex items-start gap-stack-sm">
            <span className="material-symbols-outlined text-primary">
              auto_awesome
            </span>
            <div>
              <h1 className="text-headline-sm font-bold text-on-surface">
                기본 조건 선택
              </h1>
              <p className="mt-1 text-label-md text-on-surface-variant">
                5가지 기본 조건을 간단히 선택해 주세요.
              </p>
            </div>
          </div>

          <div className="mt-stack-lg grid gap-stack-md lg:grid-cols-[minmax(0,1fr)_180px]">
            <div className="space-y-stack-sm">
              {(["who", "when"] as TripOptionType[]).map((type) => (
                <ConditionRow
                  key={type}
                  type={type}
                  value={conditions[type]}
                  active={activeType === type}
                  onToggle={() => handleToggle(type)}
                  onSelect={(selected) => handleSelect(type, selected)}
                />
              ))}

              <DestinationSelector
                selectedDestination={conditions.destination}
                selectedRegion={conditions.region}
                active={activeType === "destination"}
                onToggle={() => handleToggle("destination")}
                onSelect={(city) => {
                  setConditions((prev) => ({
                    ...prev,
                    region: city.countryName,
                    destination: city.nameKo,
                  }));
                  setActiveType("theme");
                }}
              />

              {(["theme", "level"] as TripOptionType[]).map((type) => (
                <ConditionRow
                  key={type}
                  type={type}
                  value={conditions[type]}
                  active={activeType === type}
                  onToggle={() => handleToggle(type)}
                  onSelect={(selected) => handleSelect(type, selected)}
                />
              ))}
            </div>

            <aside className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-stack-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  fact_check
                </span>
                <h2 className="text-label-md font-bold text-on-surface">
                  선택 요약
                </h2>
              </div>

              <div className="mt-stack-md space-y-stack-md">
                {tripOptionTypes.map((type) => (
                  <SummaryItem
                    key={type}
                    icon={tripOptionIcons[type]}
                    label={tripOptionLabels[type]}
                    value={conditions[type] ?? "미선택"}
                  />
                ))}
                <SummaryItem
                  icon="public"
                  label="여행지"
                  value={
                    conditions.destination
                      ? `${conditions.destination} (${conditions.region})`
                      : "미선택"
                  }
                />
              </div>
            </aside>
          </div>
        </section>

        <div className="space-y-stack-md">
          <PreparePanel
            icon="flight_takeoff"
            title="항공 준비"
            description="항공을 어떻게 준비하시겠어요?"
          >
            <div className="grid grid-cols-2 gap-stack-sm">
              {PREPARE_OPTIONS.flight.map((option) => (
                <PrepareCard
                  key={option.value}
                  selected={flightPrepare === option.value}
                  icon={option.icon}
                  title={option.title}
                  description={option.description}
                  onClick={() => setFlightPrepare(option.value)}
                />
              ))}
            </div>

            <div
              className={
                flightPrepare === "recommend"
                  ? "mt-stack-md"
                  : "mt-stack-md opacity-50"
              }
            >
              <p className="mb-2 text-label-md font-bold text-on-surface-variant">
                우선 기준
              </p>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-primary/40 text-center text-label-md font-bold">
                <button
                  type="button"
                  disabled={flightPrepare !== "recommend"}
                  onClick={() => setFlightPriority("PRICE")}
                  className={
                    flightPriority === "PRICE"
                      ? "bg-primary text-on-primary py-2 disabled:cursor-not-allowed"
                      : "bg-surface-container-lowest py-2 text-primary disabled:cursor-not-allowed"
                  }
                >
                  저렴한 가격 우선
                </button>
                <button
                  type="button"
                  disabled={flightPrepare !== "recommend"}
                  onClick={() => setFlightPriority("TIME")}
                  className={
                    flightPriority === "TIME"
                      ? "bg-primary text-on-primary py-2 disabled:cursor-not-allowed"
                      : "bg-surface-container-lowest py-2 text-primary disabled:cursor-not-allowed"
                  }
                >
                  최단 여행 시간 우선
                </button>
              </div>
            </div>
          </PreparePanel>

          <PreparePanel
            icon="hotel"
            title="숙소 준비"
            description="숙소를 어떻게 준비하시겠어요?"
          >
            <div className="grid grid-cols-2 gap-stack-sm">
              {PREPARE_OPTIONS.accommodation.map((option) => (
                <PrepareCard
                  key={option.value}
                  selected={accommodationPrepare === option.value}
                  icon={option.icon}
                  title={option.title}
                  description={option.description}
                  onClick={() => setAccommodationPrepare(option.value)}
                />
              ))}
            </div>
          </PreparePanel>
        </div>
      </div>

      <div className="card-base flex items-center justify-between gap-stack-md border border-outline-variant/60 p-stack-md">
        <button
          type="button"
          onClick={() => navigate("/trip")}
          className="btn-ghost"
        >
          이전
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady}
          className="btn-primary min-w-[180px] disabled:opacity-50"
        >
          다음 단계
          <span className="material-symbols-outlined ml-2 align-[-5px] text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}

function ConditionRow({
  type,
  value,
  active,
  onToggle,
  onSelect,
}: {
  type: TripOptionType;
  value?: string;
  active: boolean;
  onToggle: () => void;
  onSelect: (selected: string) => void;
}) {
  const { data: options = [], isLoading } = useQuery({
    queryKey: ["tripOptions", type],
    queryFn: () => tripApi.getOptions(type),
  });

  return (
    <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-stack-md px-stack-md py-stack-md text-left"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <span className="material-symbols-outlined">
            {tripOptionIcons[type]}
          </span>
        </span>

        <span className="min-w-0 flex-1 text-body-md font-bold text-on-surface">
          {BASIC_QUESTIONS[type]}
        </span>

        <span className="material-symbols-outlined text-on-surface-variant">
          {active ? "expand_less" : "expand_more"}
        </span>
      </button>

      {active && (
        <div className="border-t border-outline-variant/60 p-stack-md">
          {isLoading ? (
            <p className="text-label-md text-on-surface-variant">
              선택지를 불러오는 중...
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-stack-sm sm:grid-cols-3">
              {options.map((option) => {
                const selected = value === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(option)}
                    className={
                      selected
                        ? "rounded-lg bg-primary px-4 py-3 text-label-md font-bold text-on-primary"
                        : "rounded-lg bg-surface-container-low px-4 py-3 text-label-md font-bold text-on-surface transition hover:bg-primary-container"
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-stack-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </span>
      <div className="min-w-0">
        <p className="text-label-sm font-bold text-on-surface-variant">
          {label}
        </p>
        <p className="truncate text-label-md font-bold text-on-surface">
          {value}
        </p>
      </div>
    </div>
  );
}

function PreparePanel({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-base border border-outline-variant/60 p-stack-lg">
      <div className="flex items-start gap-stack-sm">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <div>
          <h2 className="text-headline-sm font-bold text-on-surface">
            {title}
          </h2>
          <p className="mt-1 text-label-md text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-stack-md">{children}</div>
    </section>
  );
}

function PrepareCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex min-h-[132px] flex-col items-center justify-center rounded-lg border p-stack-md text-center transition",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/15"
          : "border-outline-variant bg-surface-container-lowest hover:border-primary/50",
      ].join(" ")}
    >
      <span
        className={
          selected
            ? "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary"
            : "flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
        }
      >
        <span className="material-symbols-outlined">{icon}</span>
      </span>
      <span className="mt-stack-sm text-body-md font-bold text-on-surface">
        {title}
      </span>
      <span className="mt-1 text-label-md text-on-surface-variant">
        {description}
      </span>

      {selected && (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
          <span className="material-symbols-outlined text-[18px]">check</span>
        </span>
      )}
    </button>
  );
}
