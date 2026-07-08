import apiClient from "@/api/client";

export type TripOptionType = "who" | "when" | "region" | "theme" | "level";

// DTO 받아온거 ts용 인식 시키기
export interface PlanRequest {
  who: string;
  when: string;
  region: string;
  theme: string;
  level: string;
}

export interface PlaceOption {
  option: number;
  placeName: string;
  category: string;
  description: string;
}

export interface ScheduleItem {
  itemKey: string;
  itemType: string;
  timeSlot: string;
  title: string;
  options: PlaceOption[];
  selectedOptionIndex: number;
  replaceable: boolean;
}

export interface DayPlan {
  dayNumber: number;
  dayTitle: string;
  items: ScheduleItem[];
}

export interface TripRecommendation {
  recommendation: number;
  title: string;
  summary: string;
  days: DayPlan[];
}

export interface PlanResponse extends PlanRequest {
  prompt: string;
  aiResult: string;
  recommendations: TripRecommendation[];
}

export interface SaveTripRequest {
  userId: number;
  conditions: PlanRequest;
  recommendation: TripRecommendation;
}

export interface SaveTripResponse {
  savedTripId: number;
  message: string;
}

// 홈페이지 "내가 저장한 여행" 미리보기 / 내 일정 목록
export interface SavedTripSummary {
  id: number;
  title: string | null;
  region: string | null;
  theme: string | null;
  createdDate: string;
}

// 타입이랑 타입별 내용 미리 세팅해두기
export const tripOptionTypes: TripOptionType[] = [
  "who",
  "when",
  "region",
  "theme",
  "level",
];

export const tripOptionLabels: Record<TripOptionType, string> = {
  who: "누구와",
  when: "기간",
  region: "지역",
  theme: "테마",
  level: "여행 강도",
};

export const tripOptionIcons: Record<TripOptionType, string> = {
  who: "group",
  when: "date_range",
  region: "public",
  theme: "flag",
  level: "hiking",
};

// 백엔드랑 프론트 주소 연결하기
export const tripApi = {
  getOptions: async (type: TripOptionType) => {
    const response = await apiClient.get<string[]>(`/trip/options/${type}`);
    return response.data;
  },

  recommend: async (request: PlanRequest) => {
    const response = await apiClient.post<PlanResponse>(
      "/trip/recommend",
      request,
    );
    return response.data;
  },

  save: async (request: SaveTripRequest) => {
    const response = await apiClient.post<SaveTripResponse>(
      "/trip/save",
      request,
    );
    return response.data;
  },

  getSavedTrips: async () => {
    const response = await apiClient.get<SavedTripSummary[]>("/trip/saved");
    return response.data;
  },
};
