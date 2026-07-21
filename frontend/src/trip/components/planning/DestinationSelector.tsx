import { CityOption, tripApi } from "@/trip/api/trip";
import { useQuery } from "@tanstack/react-query";

const DESTINATION_REGION_ORDER = [
  "일본",
  "한국",
  "동남아시아",
  "중국·대만·홍콩",
  "유럽",
  "미주·대양주",
] as const;

function groupCitiesByRegion(cities: CityOption[]) {
  const map = new Map<string, CityOption[]>();
  for (const city of cities) {
    const region = city.countryName || "기타";
    const list = map.get(region) ?? [];
    list.push(city);
    map.set(region, list);
  }

  const ordered: Array<{ region: string; cities: CityOption[] }> = [];
  for (const region of DESTINATION_REGION_ORDER) {
    const list = map.get(region);
    if (list?.length) {
      ordered.push({ region, cities: list });
      map.delete(region);
    }
  }
  for (const [region, list] of map) {
    ordered.push({ region, cities: list });
  }
  return ordered;
}

export default function DestinationSelector({
  selectedDestination,
  selectedRegion,
  active,
  onToggle,
  onSelect,
}: {
  selectedDestination?: string;
  selectedRegion?: string;
  active: boolean;
  onToggle: () => void;
  onSelect: (city: CityOption) => void;
}) {
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["popularCities"],
    queryFn: tripApi.getPopularCities,
  });
  const cityGroups = groupCitiesByRegion(cities);

  return (
    <div className="trip-condition-row">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-stack-md px-stack-md py-stack-md text-left"
      >
        <span className="trip-section-icon">
          <span className="material-symbols-outlined">public</span>
        </span>

        <span className="min-w-0 flex-1 text-body-md font-bold text-on-surface">
          어디로 여행을 가시나요?
        </span>

        <span className="material-symbols-outlined text-on-surface-variant">
          {active ? "expand_less" : "expand_more"}
        </span>
      </button>

      {active && (
        <div className="border-t border-outline-variant/60 p-stack-md">
          {isLoading ? (
            <p className="text-label-md text-on-surface-variant">
              여행지를 불러오는 중...
            </p>
          ) : cities.length === 0 ? (
            <p className="text-label-md text-on-surface-variant">
              선택할 수 있는 여행지가 없습니다.
            </p>
          ) : (
            <div className="space-y-stack-md">
              {cityGroups.map((group) => (
                <section key={group.region}>
                  <h3 className="mb-2 text-label-md font-bold text-on-surface">
                    {group.region}
                  </h3>
                  <div className="grid grid-cols-2 gap-stack-sm sm:grid-cols-3">
                    {group.cities.map((city) => {
                      const selected =
                        selectedDestination === city.nameKo &&
                        selectedRegion === city.countryName;

                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => onSelect(city)}
                          className={
                            selected
                              ? "trip-choice trip-choice-selected text-left"
                              : "trip-choice text-left"
                          }
                        >
                          <span className="block truncate">{city.nameKo}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
