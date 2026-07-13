import { CityOption, tripApi } from "@/trip/api/trip";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-stack-md px-stack-md py-stack-md text-left"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
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
          <div className="grid grid-cols-2 gap-stack-sm sm:grid-cols-3">
            {isLoading ? (
              <p className="col-span-full text-label-md text-on-surface-variant">
                여행지를 불러오는 중...
              </p>
            ) : cities.length === 0 ? (
              <p className="col-span-full text-label-md text-on-surface-variant">
                선택할 수 있는 여행지가 없습니다.
              </p>
            ) : (
              cities.map((city) => {
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
                        ? "rounded-lg bg-primary px-4 py-3 text-left text-label-md font-bold text-on-primary"
                        : "rounded-lg bg-surface-container-low px-4 py-3 text-left text-label-md font-bold text-on-surface transition hover:bg-primary-container"
                    }
                  >
                    <span className="block truncate">{city.nameKo}</span>
                    <span
                      className={
                        selected
                          ? "mt-1 block text-label-sm text-on-primary/80"
                          : "mt-1 block text-label-sm text-on-surface-variant"
                      }
                    >
                      {city.countryName}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
