import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { tripApi, type CityOption, type TripOptionType } from "@/trip/api/trip";

export function OptionConditionRow({
  type,
  question,
  value,
  active,
  onToggle,
  onSelect,
}: {
  type: TripOptionType;
  question: string;
  value?: string;
  active: boolean;
  onToggle: () => void;
  onSelect: (selected: string) => void;
}) {
  const { data: options = [], isLoading } = useQuery({
    queryKey: ["tripOptions", type],
    queryFn: () => tripApi.getOptions(type),
  });

  // 조건 나오는 부분 DB로 받아와서 보여주게
  return (
    <AccordionShell
      selected={!!value}
      active={active}
      question={question}
      onToggle={onToggle}
    >
      {isLoading ? (
        <p className="text-label-md text-on-surface-variant">
          선택지를 불러오는 중...
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <ChoiceButton
              key={option}
              selected={value === option}
              onClick={() => onSelect(option)}
            >
              {option}
            </ChoiceButton>
          ))}
        </div>
      )}
    </AccordionShell>
  );
}

export function DestinationConditionRow({
  value,
  region,
  active,
  onToggle,
  onSelect,
}: {
  value?: string;
  region?: string;
  active: boolean;
  onToggle: () => void;
  onSelect: (city: CityOption) => void;
}) {
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["popularCities"],
    queryFn: tripApi.getPopularCities,
  });
  const cityGroups = cities.reduce<
    Array<{ countryName: string; cities: CityOption[] }>
  >((groups, city) => {
    const group = groups.find((item) => item.countryName === city.countryName);

    if (group) {
      group.cities.push(city);
      return groups;
    }

    return [...groups, { countryName: city.countryName, cities: [city] }];
  }, []);

  return (
    <AccordionShell
      selected={!!value}
      active={active}
      question="어디로 여행을 가시나요?"
      onToggle={onToggle}
    >
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
            <section key={group.countryName}>
              <h3 className="mb-2 text-label-md font-bold text-on-surface">
                {group.countryName}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.cities.map((city) => {
                  const selected =
                    value === city.nameKo && region === city.countryName;

                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => onSelect(city)}
                      className={
                        selected
                          ? "h-9 rounded-full bg-[#4aa3ff] px-4 text-label-md font-bold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-colors hover:bg-[#328ee8]"
                          : "h-9 rounded-full border border-outline-variant/80 bg-surface-container-lowest px-4 text-label-md font-bold text-on-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#4aa3ff]/70 hover:bg-[#4aa3ff]/5 hover:text-[#1d6fb8]"
                      }
                    >
                      {city.nameKo}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </AccordionShell>
  );
}

export function PrepareConditionRow({
  title,
  selected,
  active,
  onToggle,
  children,
}: {
  title: string;
  selected: boolean;
  active: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={
        active
          ? "border-b border-outline-variant/35 bg-primary/[0.03] last:border-b-0"
          : "border-b border-outline-variant/35 last:border-b-0"
      }
    >
      <button
        type="button"
        onClick={onToggle}
        className="grid min-h-[54px] w-full grid-cols-[24px_minmax(0,1fr)_24px] items-center gap-3 px-2 py-3.5 text-left transition-colors hover:bg-primary/[0.04]"
      >
        <StateBox selected={selected} active={active} />
        <span
          className={
            active
              ? "text-body-md font-bold text-primary"
              : selected
                ? "text-body-md font-bold text-on-surface"
                : "text-body-md font-semibold text-on-surface"
          }
        >
          {title}
        </span>
        <span
          className={
            active
              ? "material-symbols-outlined text-[20px] text-primary"
              : "material-symbols-outlined text-[20px] text-on-surface-variant"
          }
        >
          {active ? "expand_less" : "expand_more"}
        </span>
      </button>

      {active && <div className="px-2 pb-4 pl-[36px]">{children}</div>}
    </div>
  );
}

function AccordionShell({
  selected,
  active,
  question,
  onToggle,
  children,
}: {
  selected: boolean;
  active: boolean;
  question: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={
        active
          ? "border-b border-outline-variant/35 bg-primary/[0.03] last:border-b-0"
          : "border-b border-outline-variant/35 last:border-b-0"
      }
    >
      <button
        type="button"
        onClick={onToggle}
        className="grid min-h-[54px] w-full grid-cols-[24px_minmax(0,1fr)_24px] items-center gap-3 px-2 py-3.5 text-left transition-colors hover:bg-primary/[0.04]"
      >
        <StateBox selected={selected} active={active} />
        <span
          className={
            active
              ? "min-w-0 text-body-md font-bold text-primary"
              : selected
                ? "min-w-0 text-body-md font-bold text-on-surface"
                : "min-w-0 text-body-md font-semibold text-on-surface"
          }
        >
          {question}
        </span>

        <span
          className={
            active
              ? "material-symbols-outlined text-[20px] text-primary"
              : "material-symbols-outlined text-[20px] text-on-surface-variant"
          }
        >
          {active ? "expand_less" : "expand_more"}
        </span>
      </button>

      {active && <div className="px-2 pb-4 pl-[36px]">{children}</div>}
    </div>
  );
}

function StateBox({
  selected,
  active,
}: {
  selected: boolean;
  active: boolean;
}) {
  if (selected) {
    return (
      <span
        aria-hidden
        className="pointer-events-none flex h-[18px] w-[18px] items-center justify-center rounded-[4px] bg-primary text-on-primary"
      >
        <span className="material-symbols-outlined text-[14px] font-bold leading-none">
          check
        </span>
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={
        active
          ? "pointer-events-none block h-[18px] w-[18px] rounded-[4px] border-2 border-primary bg-surface-container-lowest"
          : "pointer-events-none block h-[18px] w-[18px] rounded-[4px] border border-outline-variant bg-surface-container-lowest"
      }
    />
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "h-9 rounded-full bg-[#4aa3ff] px-4 text-label-md font-bold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-colors hover:bg-[#328ee8]"
          : "h-9 rounded-full border border-outline-variant/80 bg-surface-container-lowest px-4 text-label-md font-bold text-on-surface shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#4aa3ff]/70 hover:bg-[#4aa3ff]/5 hover:text-[#1d6fb8]"
      }
    >
      {children}
    </button>
  );
}
