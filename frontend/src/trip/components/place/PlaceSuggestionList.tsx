import { useQuery } from "@tanstack/react-query";
import { placeApi, type PlaceCategory } from "@/trip/api/place";
import { PLACE_CATEGORY_LABELS } from "@/trip/utils/placeCategoryLabels";

export type PlaceSuggestionTab = "schedule" | "meal" | "experience";

interface Props {
  city: string;
  tab: PlaceSuggestionTab;
  onDragEnd: () => void;
}

const TAB_CATEGORIES: Record<PlaceSuggestionTab, PlaceCategory[]> = {
  schedule: [
    "ATTRACTION",
    "SHOPPING",
    "NATURE",
    "CULTURE",
    "TRANSPORT",
    "HOTEL",
  ],
  meal: ["RESTAURANT", "CAFE"],
  experience: ["ACTIVITY"],
};

const getItemType = (category: PlaceCategory) => {
  if (["RESTAURANT", "CAFE"].includes(category)) return "Meal";
  if (category === "ACTIVITY") return "Experience";
  if (category === "TRANSPORT") return "Transport";
  if (category === "HOTEL") return "Hotel";
  return "Activity";
};

export default function PlaceSuggestionList({ city, tab, onDragEnd }: Props) {
  const {
    data: places = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trip-places", city],
    queryFn: () => placeApi.getPlaces(city),
    enabled: Boolean(city.trim()),
  });

  if (isLoading)
    return <p className="py-6 text-center">장소를 불러오는 중입니다.</p>;
  if (isError)
    return (
      <p className="py-6 text-center text-error">장소를 불러오지 못했습니다.</p>
    );

  const visiblePlaces = places.filter((place) =>
    TAB_CATEGORIES[tab].includes(place.category),
  );

  if (visiblePlaces.length === 0) {
    return <p className="py-6 text-center">표시할 장소가 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-outline-variant/50">
      {visiblePlaces.map((place) => {
        const card = {
          id: `place-${place.id}`,
          itemType: getItemType(place.category),
          placeCategory: place.category,
          badge: PLACE_CATEGORY_LABELS[place.category],
          title: place.name,
          description:
            place.description ?? place.address ?? "장소 정보가 없습니다.",
          imageUrl: place.imageUrl ?? undefined,
          sourceUrl: place.externalUrl ?? undefined,
        };

        return (
          <article
            key={place.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "copy";
              event.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "recommendation", card }),
              );
              event.dataTransfer.setDragImage(event.currentTarget, 24, 24);
            }}
            onDragEnd={onDragEnd}
            className="cursor-grab px-1 py-stack-sm hover:bg-surface-container-low"
          >
            <div className="flex gap-stack-sm">
              {place.imageUrl && (
                <img
                  src={place.imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-sm object-cover"
                />
              )}
              <div className="min-w-0">
                <span className="text-label-sm font-bold text-tertiary">
                  {card.badge}
                </span>
                <h4 className="truncate text-label-md font-bold">
                  {card.title}
                </h4>
                <p className="line-clamp-1 text-label-sm text-on-surface-variant">
                  {card.description}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
