import apiClient from "@/common/api/client";

export type TripOptionType = "who" | "when" | "theme" | "level";

// DTO 받아온거 ts용 인식 시키기
export interface PlanRequest {
  who: string;
  startDate?: string;
  when: string;
  region: string;
  theme: string;
  level: string;
  flightCondition?: FlightCondition;
  destination?: string;
  accommodationCondition?: AccommodationCondition;
}

export interface FlightCondition {
  skip: boolean;
  priority?: "PRICE" | "TIME" | "DIRECT";
  seatClass?: "ECONOMY" | "BUSINESS";
  directOnly?: boolean;
  preferredDepartureTime?: "MORNING" | "AFTERNOON" | "EVENING";
}

export interface AccommodationCondition {
  skip: boolean;
  accommodationType?: "HOTEL" | "RESORT" | "GUESTHOUSE";
  priority?: "PRICE" | "LOCATION" | "RATING";
  maxPrice?: number;
}

export interface ScheduleItem {
  itemKey: string;
  itemType: string;
  timeSlot: string;
  title: string;
  description?: string;
  address?: string;
  durationMinutes?: number;
  estimatedCost?: number;
  imageUrl?: string;
  locked?: boolean;
  replaceable: boolean;
  slotOrder?: number;
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

export interface RecommendationBlock {
  blockId: string;
  category: "SCHEDULE" | "FOOD" | "EXPERIENCE" | string;
  title: string;
  description: string;
  address?: string;
  durationMinutes?: number;
  estimatedCost?: number;
  imageUrl?: string;
}

export interface PlanResponse extends PlanRequest {
  prompt: string;
  aiResult: string;
  recommendations: TripRecommendation[];
  sideBlocks: RecommendationBlock[];
}

export interface FlightSegment {
  airlineName: string;
  flightNumber: string;
  departureAirportCode: string;
  departureAirportName: string;
  arrivalAirportCode: string;
  arrivalAirportName: string;
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
}

export interface FlightOffer {
  outboundFlight?: FlightSegment;
  returnFlight?: FlightSegment;
  price?: number;
  currency?: string;
  provider?: string;
  externalUrl?: string;
  departureToken?: string;
  arrivalAirportCode?: string;
  priceType?: string;
}

export interface FlightSelection extends FlightOffer {
  skipped: boolean;
}

export interface FlightReturnRequest {
  region?: string;
  destination?: string;
  startDate?: string;
  when: string;
  arrivalAirportCode: string;
  departureToken: string;
  flightCondition?: FlightCondition;
}

export interface AccommodationOption {
  accommodationId?: number;
  accommodationName?: string;
  accommodationType?: string;
  cityName?: string;
  countryName?: string;
  region?: string;
  checkInDate?: string;
  checkOutDate?: string;
  address?: string;
  price?: number;
  currency?: string;
  rating?: number;
  provider?: string;
  externalUrl?: string;
  imageUrl?: string;
}

export interface AccommodationSelection extends AccommodationOption {
  skipped: boolean;
}

export interface SaveTripRequest {
  conditions: PlanRequest;
  recommendation: TripRecommendation;
  flightSelection?: FlightSelection | null;
  accommodationSelection?: AccommodationSelection | null;
}

export interface TripFlowState {
  conditions: PlanRequest;
  planningMode?: "ai" | "manual";
  flightSelection?: FlightSelection | null;
  accommodationSelection?: AccommodationSelection | null;
}

export interface SaveTripResponse {
  savedTripId: number;
  message: string;
}
export interface SavedTrip {
  savedTripId: number;
  userId: number;
  conditions: PlanRequest;
  recommendation: TripRecommendation;
  flightSelection?: FlightSelection | null;
  accommodationSelection?: AccommodationSelection | null;
  createdDate: string;
}

export interface SavedTripSummary {
  id: number;
  title: string | null;
  region: string | null;
  theme: string | null;
  startDate: string | null;
  createdDate: string;
}

export interface CityOption {
  id: number;
  nameKo: string;
  nameEn: string;
  countryName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

// 타입이랑 타입별 내용 미리 세팅해두기
export const tripOptionTypes: TripOptionType[] = [
  "who",
  "when",
  "theme",
  "level",
];

export const tripOptionLabels: Record<TripOptionType, string> = {
  who: "누구와",
  when: "기간",
  theme: "테마",
  level: "여행 강도",
};

export const tripOptionIcons: Record<TripOptionType, string> = {
  who: "group",
  when: "date_range",
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

  searchFlights: async (request: PlanRequest) => {
    const response = await apiClient.post<FlightOffer[]>("/flight/search", {
      region: request.region,
      destination: request.destination ?? request.region,
      startDate: request.startDate,
      when: request.when,
      flightCondition: request.flightCondition,
    });
    return response.data;
  },

  searchReturnFlights: async (request: FlightReturnRequest) => {
    const response = await apiClient.post<FlightOffer[]>("/flight/returns", {
      region: request.region,
      destination: request.destination,
      startDate: request.startDate,
      when: request.when,
      arrivalAirportCode: request.arrivalAirportCode,
      departureToken: request.departureToken,
      flightCondition: request.flightCondition,
    });
    return response.data;
  },

  searchAccommodations: async (request: PlanRequest) => {
    const response = await apiClient.post<AccommodationOption[]>(
      "/accommodation/search",
      {
        region: request.region,
        destination: request.destination ?? request.region,
        startDate: request.startDate,
        when: request.when,
        accommodationCondition: request.accommodationCondition,
      },
    );
    return response.data;
  },

  save: async (request: SaveTripRequest) => {
    const response = await apiClient.post<SaveTripResponse>(
      "/trip/saved",
      request,
    );
    return response.data;
  },

  updateSavedTrip: async (savedTripId: number, request: SaveTripRequest) => {
    await apiClient.put<void>(`/trip/saved/${savedTripId}`, request);
  },

  getSavedTrip: async (savedTripId: number) => {
    const response = await apiClient.get<SavedTrip>(
      `/trip/saved/${savedTripId}`,
    );
    return response.data;
  },

  getSavedTripsByUser: async (userId: number) => {
    void userId;
    const response = await apiClient.get<SavedTrip[]>("/trip/saved/me");
    return response.data;
  },

  getSavedTrips: async () => {
    const response = await apiClient.get<SavedTrip[]>("/trip/saved/me");
    return response.data.map(
      (trip): SavedTripSummary => ({
        id: trip.savedTripId,
        title: trip.recommendation?.title ?? null,
        region: trip.conditions?.region ?? null,
        theme: trip.conditions?.theme ?? null,
        startDate: trip.conditions?.startDate ?? null,
        createdDate: trip.createdDate,
      }),
    );
  },

  deleteSavedTrip: async (savedTripId: number) => {
    await apiClient.delete<void>(`/trip/remove/${savedTripId}`);
  },

  getPopularCities: async () => {
    const response = await apiClient.get<{ data: CityOption[] }>(
      "/cities/popular",
    );
    return response.data.data;
  },

  searchCities: async (keyword: string) => {
    const response = await apiClient.get<{ data: CityOption[] }>(
      "/api/flight/search",
      {
        params: { keyword },
      },
    );
    return response.data.data;
  },
};
