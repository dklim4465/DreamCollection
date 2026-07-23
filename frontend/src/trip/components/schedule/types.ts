import type { PlaceCategory } from "@/trip/api/place";

export type SuggestionTab = "schedule" | "meal" | "experience" | "custom";

export interface RecommendationCard {
  id: string;
  itemType: "Activity" | "Meal" | "Experience" | "Transport" | "Hotel";
  /** PlaceCategory enum name when dragged from PlaceSuggestionList */
  placeCategory?: PlaceCategory;
  badge: string;
  title: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
}
