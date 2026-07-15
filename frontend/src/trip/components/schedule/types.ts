export type ScheduleMode = "ai" | "manual";

export type SuggestionTab = "schedule" | "meal" | "experience" | "custom";

export interface RecommendationCard {
  id: string;
  itemType: "Activity" | "Meal" | "Experience" | "Transport" | "Hotel";
  badge: string;
  title: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
}
