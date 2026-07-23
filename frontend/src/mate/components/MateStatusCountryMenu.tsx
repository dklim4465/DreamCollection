// src/mate/components/MateStatusCountryMenu.tsx
import { useQuery } from "@tanstack/react-query";
import { mateCountryApi } from "@/mate/api/mateApi";
import {
  MATE_POST_STATUSES,
  MATE_POST_STATUS_LABELS,
  type MatePostStatus,
} from "@/mate/types/mate";

interface Props {
  status: MatePostStatus;
  countryCode: string | null;
  onChange: (status: MatePostStatus, countryCode: string | null) => void;
}

function countryFlag(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export default function MateStatusCountryMenu({
  status,
  countryCode,
  onChange,
}: Props) {
  const { data: countries } = useQuery({
    queryKey: ["mate-countries"],
    queryFn: () => mateCountryApi.getCountries().then((res) => res.data.data),
  });

  const selectedCountryName = countries?.find(
    (c) => c.countryCode === countryCode,
  )?.countryName;

  return (
    <div className="flex gap-2 mb-stack-md">
      {MATE_POST_STATUSES.map((s) => {
        const active = s === status;
        return (
          <div key={s} className="relative group">
            <button
              onClick={() => onChange(s, null)}
              className={
                active
                  ? "chip-primary flex items-center gap-1"
                  : "chip bg-surface-container text-on-surface-variant flex items-center gap-1"
              }
            >
              <span>{MATE_POST_STATUS_LABELS[s]}</span>
              {active && selectedCountryName && (
                <span className="text-[11px] opacity-80">
                  · {selectedCountryName}
                </span>
              )}
            </button>

            <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-10">
              <div className="flex flex-col min-w-[140px] bg-surface border border-outline-variant rounded-lg shadow-lg p-1 gap-0.5">
                <button
                  onClick={() => onChange(s, null)}
                  className={
                    s === status && countryCode === null
                      ? "text-left px-3 py-1.5 rounded-md bg-primary-container text-on-primary-container text-label-md"
                      : "text-left px-3 py-1.5 rounded-md hover:bg-surface-container text-label-md"
                  }
                >
                  전체 국가
                </button>
                {(countries ?? []).map((c) => {
                  const isActive =
                    s === status && c.countryCode === countryCode;
                  return (
                    <button
                      key={c.countryCode}
                      onClick={() => onChange(s, c.countryCode)}
                      className={
                        isActive
                          ? "text-left px-3 py-1.5 rounded-md bg-primary-container text-on-primary-container text-label-md flex items-center gap-1.5"
                          : "text-left px-3 py-1.5 rounded-md hover:bg-surface-container text-label-md flex items-center gap-1.5"
                      }
                    >
                      <span>{countryFlag(c.countryCode)}</span>
                      <span>{c.countryName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
