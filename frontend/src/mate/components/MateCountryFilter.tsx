// src/mate/components/MateCountryFilter.tsx
import { useQuery } from "@tanstack/react-query";
import { mateCountryApi } from "@/mate/api/mateApi";

interface Props {
  value: string | null;
  onChange: (countryCode: string | null) => void;
}

function countryFlag(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export default function MateCountryFilter({ value, onChange }: Props) {
  const { data: countries } = useQuery({
    queryKey: ["mate-countries"],
    queryFn: () => mateCountryApi.getCountries().then((res) => res.data.data),
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-stack-md">
      <button
        onClick={() => onChange(null)}
        className={
          value === null
            ? "chip-primary shrink-0"
            : "chip bg-surface-container text-on-surface-variant shrink-0"
        }
      >
        전체
      </button>
      {(countries ?? []).map((country) => {
        const active = country.countryCode === value;
        return (
          <button
            key={country.countryCode}
            onClick={() => onChange(country.countryCode)}
            className={
              active
                ? "chip-primary shrink-0 flex items-center gap-1"
                : "chip bg-surface-container text-on-surface-variant shrink-0 flex items-center gap-1"
            }
          >
            <span>{countryFlag(country.countryCode)}</span>
            <span>{country.countryName}</span>
          </button>
        );
      })}
    </div>
  );
}
