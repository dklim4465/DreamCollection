import type {
  PlanRequest,
  PlanResponse,
  TripRecommendation,
} from "@/trip/api/trip";

const DEFAULT_DAY_COUNT = 1;
const DAY_COUNT_PATTERN = /(\d+)일/;

export function createManualPlanResult(conditions: PlanRequest): PlanResponse {
  const recommendation = createManualRecommendation(conditions);

  return {
    ...conditions,
    prompt: "",
    aiResult: "",
    recommendations: [recommendation],
    sideBlocks: [],
  };
}

function createManualRecommendation(
  conditions: PlanRequest,
): TripRecommendation {
  const destination = conditions.destination ?? conditions.region;

  return {
    recommendation: 1,
    title: `${destination} 개인 일정`,
    summary: `${conditions.when} ${conditions.theme} 개인 일정입니다.`,
    days: Array.from({ length: getDayCount(conditions.when) }, (_, index) => {
      const dayNumber = index + 1;

      return {
        dayNumber,
        dayTitle: `${dayNumber}일차 개인 일정`,
        items: [],
      };
    }),
  };
}

function getDayCount(when: string) {
  const match = DAY_COUNT_PATTERN.exec(when);
  return match ? Number(match[1]) : DEFAULT_DAY_COUNT;
}
