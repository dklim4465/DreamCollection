import apiClient from "@/common/api/client";
import type { ApiResponse } from "@/types";

export type PlaceCategory =
  | "ATTRACTION"
  | "RESTAURANT"
  | "CAFE"
  | "SHOPPING"
  | "NATURE"
  | "CULTURE"
  | "ACTIVITY"
  | "TRANSPORT"
  | "HOTEL";

export interface PlaceOption {
  id: number;
  externalPlaceId: string;
  source: string;
  name: string;
  category: PlaceCategory;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  priceLevel?: string | null;
  placeType?: string | null;
  openingHoursText?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  externalUrl?: string | null;
}

export const placeApi = {
  getPlaces: async (city: string, category?: PlaceCategory) => {
    const response = await apiClient.get<ApiResponse<PlaceOption[]>>(
      "/places",
      {
        params: {
          city,
          ...(category ? { category } : {}),
        },
      },
    );

    return response.data.data;
  },
};
