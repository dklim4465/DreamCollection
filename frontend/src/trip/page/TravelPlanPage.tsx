import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  tripOptionTypes,
  type AccommodationCondition,
  type CityOption,
  type FlightCondition,
  type PlanRequest,
  type TripFlowState,
  type TripOptionType,
} from "@/trip/api/trip";
import {
  DestinationConditionRow,
  OptionConditionRow,
  PrepareConditionRow,
} from "@/trip/components/planning/TripConditionRows";
import "@/trip/styles/trip.css";

type FlightPrepareType = "recommend" | "booked";
type AccommodationPrepareType = "recommend" | "booked";
type FlightPriority = NonNullable<FlightCondition["priority"]>;
type AccommodationPriority = NonNullable<AccommodationCondition["priority"]>;
type BasicConditionType = TripOptionType | "destination";
type PrepareConditionType = "flight" | "accommodation";

const BASIC_QUESTIONS: Record<TripOptionType, string> = {
  who: "누구와 함께 여행하시나요?",
  when: "여행 기간은 어떻게 되나요?",
  theme: "어떤 테마를 원하시나요?",
  level: "어떤 여행 스타일을 선호하시나요?",
};

const BASIC_SUMMARY_LABELS: Record<BasicConditionType, string> = {
  who: "여행 동행",
  when: "여행 기간",
  destination: "여행 지역",
  theme: "여행 테마",
  level: "여행 스타일",
};

const CONDITION_ORDER: BasicConditionType[] = [
  "who",
  "when",
  "destination",
  "theme",
  "level",
];

const FLIGHT_PRIORITY_OPTIONS: Array<{
  value: FlightPriority;
  label: string;
}> = [
  { value: "PRICE", label: "저렴한 가격 우선" },
  { value: "TIME", label: "최단 여행 시간 우선" },
];

const ACCOMMODATION_PRIORITY_OPTIONS: Array<{
  value: AccommodationPriority;
  label: string;
}> = [
  { value: "PRICE", label: "저렴한 가격 우선" },
  { value: "LOCATION", label: "좋은 위치 우선" },
  { value: "RATING", label: "높은 평점 우선" },
];

export default function TravelPlanPage() {
  const navigate = useNavigate();
  const [activeBasicType, setActiveBasicType] =
    useState<BasicConditionType | null>(null);
  const [activePrepareType, setActivePrepareType] =
    useState<PrepareConditionType | null>(null);
  const [conditions, setConditions] = useState<Partial<PlanRequest>>({});
  const [flightPrepare, setFlightPrepare] = useState<FlightPrepareType | null>(
    null,
  );
  const [flightPriority, setFlightPriority] = useState<FlightPriority>("PRICE");
  const [accommodationPrepare, setAccommodationPrepare] =
    useState<AccommodationPrepareType | null>(null);
  const [accommodationPriority, setAccommodationPriority] =
    useState<AccommodationPriority>("PRICE");

  const isReady =
    tripOptionTypes.every((type) => conditions[type]) &&
    !!conditions.region &&
    !!conditions.destination &&
    flightPrepare !== null &&
    accommodationPrepare !== null;

  const handleSelect = (type: TripOptionType, selected: string) => {
    setConditions((prev) => ({ ...prev, [type]: selected }));

    if (type === "when") {
      setActiveBasicType("destination");
      return;
    }

    const nextIndex = CONDITION_ORDER.indexOf(type) + 1;
    if (nextIndex < CONDITION_ORDER.length) {
      setActiveBasicType(CONDITION_ORDER[nextIndex]);
    } else {
      setActiveBasicType(null);
      setActivePrepareType("flight");
    }
  };

  const handleSelectDestination = (city: CityOption) => {
    setConditions((prev) => ({
      ...prev,
      region: city.countryName,
      destination: city.nameKo,
    }));
    setActiveBasicType("theme");
  };

  const handleSelectFlightPrepare = (prepare: FlightPrepareType) => {
    setFlightPrepare(prepare);

    if (prepare === "booked") {
      setActivePrepareType("accommodation");
    }
  };

  const handleSelectFlightPriority = (priority: FlightPriority) => {
    setFlightPriority(priority);
    setActivePrepareType("accommodation");
  };

  const handleSelectAccommodationPrepare = (
    prepare: AccommodationPrepareType,
  ) => {
    setAccommodationPrepare(prepare);

    if (prepare === "booked") {
      setActivePrepareType(null);
    }
  };

  const handleSelectAccommodationPriority = (
    priority: AccommodationPriority,
  ) => {
    setAccommodationPriority(priority);
    setActivePrepareType(null);
  };

  const handleReset = () => {
    setConditions({});
    setFlightPrepare(null);
    setFlightPriority("PRICE");
    setAccommodationPrepare(null);
    setAccommodationPriority("PRICE");
    setActiveBasicType(null);
    setActivePrepareType(null);
  };

  const createPlanRequest = (): PlanRequest => ({
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
            priority: accommodationPriority,
          }
        : {
            skip: true,
          },
  });

  const handleStartPlanning = (planningMode: "ai" | "manual") => {
    if (!isReady) return;

    const request = createPlanRequest();

    const flowState: TripFlowState = {
      conditions: request,
      planningMode,
    };

    const entryPath = getTripFlowEntryPath(request);

    navigate(entryPath, {
      state:
        entryPath === "/trip/result"
          ? {
              ...flowState,
              pendingBuild: true,
            }
          : flowState,
    });
  };

  const handleAiSubmit = () => handleStartPlanning("ai");

  const handleManualSubmit = () => handleStartPlanning("manual");

  return (
    <div className="trip-page">
      <div className="mx-auto grid w-full max-w-[1240px] items-start gap-8 xl:grid-cols-[minmax(0,760px)_320px]">
        <main className="min-w-0">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-headline-md font-bold text-on-surface">
                여행 조건 선택
              </h1>
              <p className="mt-2 text-body-md text-on-surface-variant">
                원하는 여행 조건을 선택하면 맞춤 일정을 제안해드려요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/trip/saved")}
              className="inline-flex shrink-0 items-center gap-1 text-label-md font-bold text-primary transition-colors hover:text-primary/80"
            >
              내 일정 보기
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>

          <div className="rounded-[12px] border border-outline-variant/35 bg-surface-container-lowest p-4 sm:p-5">
            <section>
              <h2 className="text-title-md font-bold text-on-surface">
                기본 조건
              </h2>
              <div className="mt-3">
                {(["who", "when"] as TripOptionType[]).map((type) => (
                  <OptionConditionRow
                    key={type}
                    type={type}
                    question={BASIC_QUESTIONS[type]}
                    value={conditions[type]}
                    active={activeBasicType === type}
                    onToggle={() =>
                      setActiveBasicType((prev) =>
                        prev === type ? null : type,
                      )
                    }
                    onSelect={(selected) => handleSelect(type, selected)}
                  />
                ))}

                <DestinationConditionRow
                  value={conditions.destination}
                  region={conditions.region}
                  active={activeBasicType === "destination"}
                  onToggle={() =>
                    setActiveBasicType((prev) =>
                      prev === "destination" ? null : "destination",
                    )
                  }
                  onSelect={handleSelectDestination}
                />

                {(["theme", "level"] as TripOptionType[]).map((type) => (
                  <OptionConditionRow
                    key={type}
                    type={type}
                    question={BASIC_QUESTIONS[type]}
                    value={conditions[type]}
                    active={activeBasicType === type}
                    onToggle={() =>
                      setActiveBasicType((prev) =>
                        prev === type ? null : type,
                      )
                    }
                    onSelect={(selected) => handleSelect(type, selected)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-title-md font-bold text-on-surface">
                예약 준비
              </h2>

              <div className="mt-3">
                <PrepareConditionRow
                  title="항공권을 추천해드릴까요?"
                  selected={flightPrepare !== null}
                  active={activePrepareType === "flight"}
                  onToggle={() =>
                    setActivePrepareType((prev) =>
                      prev === "flight" ? null : "flight",
                    )
                  }
                >
                  <PrepareMethodSelector
                    firstLabel="추천받기"
                    firstDescription="조건에 맞는 항공권을 추천받아요."
                    secondLabel="직접 입력하기"
                    secondDescription="이미 예약한 항공권이 있어요."
                    firstSelected={flightPrepare === "recommend"}
                    secondSelected={flightPrepare === "booked"}
                    onFirstSelect={() => handleSelectFlightPrepare("recommend")}
                    onSecondSelect={() => handleSelectFlightPrepare("booked")}
                  />

                  <PrioritySelector
                    title="우선 기준"
                    disabled={flightPrepare !== "recommend"}
                    options={FLIGHT_PRIORITY_OPTIONS}
                    value={flightPriority}
                    onChange={handleSelectFlightPriority}
                  />
                </PrepareConditionRow>

                <PrepareConditionRow
                  title="숙소를 추천해드릴까요?"
                  selected={accommodationPrepare !== null}
                  active={activePrepareType === "accommodation"}
                  onToggle={() =>
                    setActivePrepareType((prev) =>
                      prev === "accommodation" ? null : "accommodation",
                    )
                  }
                >
                  <PrepareMethodSelector
                    firstLabel="추천받기"
                    firstDescription="여행 스타일에 맞는 숙소를 추천받아요."
                    secondLabel="직접 입력하기"
                    secondDescription="이미 예약한 숙소가 있어요."
                    firstSelected={accommodationPrepare === "recommend"}
                    secondSelected={accommodationPrepare === "booked"}
                    onFirstSelect={() =>
                      handleSelectAccommodationPrepare("recommend")
                    }
                    onSecondSelect={() =>
                      handleSelectAccommodationPrepare("booked")
                    }
                  />

                  <PrioritySelector
                    title="숙소 우선 기준"
                    disabled={accommodationPrepare !== "recommend"}
                    options={ACCOMMODATION_PRIORITY_OPTIONS}
                    value={accommodationPriority}
                    onChange={handleSelectAccommodationPriority}
                  />
                </PrepareConditionRow>
              </div>
            </section>

            <div className="sticky bottom-0 z-10 mt-6 bg-surface-container-lowest/95 py-4 backdrop-blur">
              {!isReady && (
                <p className="mb-2 text-label-sm font-semibold text-error">
                  모든 조건을 선택해주세요
                </p>
              )}
              <div className="grid gap-stack-sm sm:grid-cols-2">
                <span
                  title={!isReady ? "위 조건을 모두 선택해주세요" : undefined}
                >
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    disabled={!isReady}
                    className="h-12 w-full rounded-lg border border-outline-variant/70 bg-surface-container-lowest px-5 text-label-lg font-bold text-on-surface transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    직접 일정 만들기
                  </button>
                </span>

                <span
                  title={!isReady ? "위 조건을 모두 선택해주세요" : undefined}
                >
                  <button
                    type="button"
                    onClick={handleAiSubmit}
                    disabled={!isReady}
                    className="h-12 w-full rounded-lg bg-primary px-5 text-label-lg font-bold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-on-surface-variant"
                  >
                    이 조건으로 일정 추천받기
                  </button>
                </span>
              </div>
            </div>
          </div>
        </main>

        <aside className="min-w-0 self-start xl:mt-40">
          <section className="rounded-[12px] border border-outline-variant/35 bg-surface-container-low/80 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-stack-sm">
              <h2 className="text-title-md font-bold text-on-surface">
                현재 선택한 조건
              </h2>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-label-md font-bold text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">
                  refresh
                </span>
                초기화
              </button>
            </div>

            <div className="mt-5">
              <h3 className="text-label-sm font-bold text-on-surface-variant">
                기본 조건
              </h3>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <SummaryCard
                  label={BASIC_SUMMARY_LABELS.who}
                  value={conditions.who}
                />
                <SummaryCard
                  label={BASIC_SUMMARY_LABELS.when}
                  value={conditions.when}
                />
                <SummaryCard
                  label={BASIC_SUMMARY_LABELS.destination}
                  value={conditions.destination}
                />
                <SummaryCard
                  label={BASIC_SUMMARY_LABELS.theme}
                  value={conditions.theme}
                />
                <SummaryCard
                  label={BASIC_SUMMARY_LABELS.level}
                  value={conditions.level}
                  wide
                />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-label-sm font-bold text-on-surface-variant">
                예약 준비
              </h3>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <SummaryCard
                  label="항공권 준비"
                  value={
                    flightPrepare === null
                      ? undefined
                      : flightPrepare === "recommend"
                        ? "추천받기"
                        : "직접 입력하기"
                  }
                />
                <SummaryCard
                  label="숙소 준비"
                  value={
                    accommodationPrepare === null
                      ? undefined
                      : accommodationPrepare === "recommend"
                        ? "추천받기"
                        : "직접 입력하기"
                  }
                />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PrepareMethodSelector({
  firstLabel,
  firstDescription,
  secondLabel,
  secondDescription,
  firstSelected,
  secondSelected,
  onFirstSelect,
  onSecondSelect,
}: {
  firstLabel: string;
  firstDescription: string;
  secondLabel: string;
  secondDescription: string;
  firstSelected: boolean;
  secondSelected: boolean;
  onFirstSelect: () => void;
  onSecondSelect: () => void;
}) {
  return (
    <div className="grid gap-stack-sm md:grid-cols-2">
      <PrepareOption
        selected={firstSelected}
        title={firstLabel}
        description={firstDescription}
        onClick={onFirstSelect}
      />
      <PrepareOption
        selected={secondSelected}
        title={secondLabel}
        description={secondDescription}
        onClick={onSecondSelect}
      />
    </div>
  );
}

function PrepareOption({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "rounded-lg border border-primary bg-primary/5 px-4 py-3 text-left transition-colors"
          : "rounded-lg border border-outline-variant/70 bg-surface-container-lowest px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
      }
    >
      <span
        className={
          selected
            ? "block text-label-md font-bold text-primary"
            : "block text-label-md font-bold text-on-surface"
        }
      >
        {title}
      </span>
      <span className="mt-1 block text-label-sm text-on-surface-variant">
        {description}
      </span>
    </button>
  );
}

function PrioritySelector<T extends string>({
  title,
  disabled,
  options,
  value,
  onChange,
}: {
  title: string;
  disabled: boolean;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={disabled ? "mt-stack-md opacity-50" : "mt-stack-md"}>
      <p className="mb-2 text-label-md font-bold text-on-surface-variant">
        {title}
      </p>
      <div
        className="grid overflow-hidden rounded-full border border-outline-variant/70 bg-surface-container-lowest text-center text-label-md font-bold"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={
              value === option.value
                ? "bg-primary px-4 py-2.5 text-on-primary disabled:cursor-not-allowed"
                : "border-l border-outline-variant/70 px-4 py-2.5 text-on-surface-variant first:border-l-0 hover:bg-primary/5 disabled:cursor-not-allowed"
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  wide = false,
}: {
  label: string;
  value?: string;
  wide?: boolean;
}) {
  const hasValue = !!value;

  return (
    <div
      className={
        wide
          ? "col-span-2 rounded-[10px] border border-outline-variant/35 bg-surface-container-lowest px-4 py-3.5"
          : "rounded-[10px] border border-outline-variant/35 bg-surface-container-lowest px-4 py-3.5"
      }
    >
      <span className="block text-[12px] font-medium leading-none text-on-surface-variant">
        {label}
      </span>
      <span
        className={
          hasValue
            ? "mt-2 block truncate text-[15px] font-semibold leading-snug text-primary"
            : "mt-2 block truncate text-[14px] font-medium leading-snug text-on-surface-variant/70"
        }
      >
        {hasValue ? value : "선택 필요"}
      </span>
    </div>
  );
}

function getTripFlowEntryPath(request: PlanRequest) {
  if (!request.flightCondition?.skip) {
    return "/trip/flight";
  }

  if (!request.accommodationCondition?.skip) {
    return "/trip/accommodation";
  }

  return "/trip/result";
}
