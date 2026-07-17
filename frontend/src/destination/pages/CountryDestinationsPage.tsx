import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cityApi, type CityItem } from "@/common/api/cityApi";
import { proxyImage } from "@/common/utils/proxyImage";
import { countryInfoMap } from "@/destination/data/countryInfo";

const ACCENT_CLASSES = {
  primary: {
    tint: "card-tint-primary",
    badge: "bg-primary-container text-on-primary-container",
    label: "text-primary",
  },
  secondary: {
    tint: "card-tint-secondary",
    badge: "bg-secondary-container text-on-secondary-container",
    label: "text-secondary",
  },
  tertiary: {
    tint: "card-tint-tertiary",
    badge: "bg-tertiary-container text-on-tertiary-container",
    label: "text-tertiary",
  },
} as const;

/**
 * 검색창에서 나라(일본/태국/미국 등)를 클릭하면 오는 페이지.
 * 그 나라 정보(통화/언어/비자/여행 적기)와 대표 도시 3곳을 보여주고,
 * 도시 하나를 먼저 "선택"한 다음 하단의 [이 도시로 일정 만들기] 버튼을 눌러야
 * 일정 만들기 페이지로 이동한다 (카드를 바로 누르면 이동하던 것에서, 선택 → 확정
 * 2단계로 바꿔서 실수로 다른 여행지를 누르는 걸 방지함).
 * 라우트: /destinations/country/:countryCode (예: /destinations/country/JP)
 */
export default function CountryDestinationsPage() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();
  const code = countryCode?.toUpperCase() ?? "";
  const [selectedCity, setSelectedCity] = useState<CityItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["cities", "popular"],
    queryFn: cityApi.getPopular,
    retry: false,
  });

  const allCities = data?.data?.data ?? [];
  const cities = useMemo(
    () => allCities.filter((c) => c.countryCode === code),
    [allCities, code]
  );
  const countryName = cities[0]?.countryName ?? countryCode;
  const info = countryInfoMap[code];
  const accent = ACCENT_CLASSES[info?.accentClass ?? "primary"];

  const goPlanTrip = () => {
    if (!selectedCity) return;
    const params = new URLSearchParams({
      destination: selectedCity.nameKo,
      region: selectedCity.countryName,
    });
    navigate(`/trip/new?${params.toString()}`);
  };

  if (isLoading) {
    return <p className="text-body-md text-on-surface-variant py-stack-xl text-center">불러오는 중...</p>;
  }

  if (cities.length === 0) {
    return (
      <div className="text-center py-stack-xl">
        <p className="text-body-md text-on-surface-variant mb-stack-sm">
          {countryName}의 등록된 여행지가 아직 없어요.
        </p>
        <button type="button" onClick={() => navigate("/")} className="btn-primary">
          홈으로
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* 나라 소개 헤더 */}
      <p className={`${accent.label} text-label-sm tracking-[0.3em] uppercase mb-2`}>Destinations</p>
      <h1 className="text-headline-lg font-black mb-2">{countryName}</h1>
      {info && <p className="text-body-lg text-on-surface-variant mb-stack-lg">{info.tagline}</p>}

      {info && (
        <div className={`${accent.tint} p-stack-lg grid grid-cols-2 md:grid-cols-4 gap-stack-md mb-stack-lg`}>
          <InfoItem icon="payments" label="통화" value={info.currency} accentBadge={accent.badge} />
          <InfoItem icon="translate" label="언어" value={info.language} accentBadge={accent.badge} />
          <InfoItem icon="badge" label="비자" value={info.visa} accentBadge={accent.badge} />
          <InfoItem icon="wb_sunny" label="여행 적기" value={info.bestSeason} accentBadge={accent.badge} />
        </div>
      )}

      <h2 className="text-headline-sm font-bold mb-stack-md">{countryName}의 대표 도시</h2>
      <p className="text-label-md text-on-surface-variant mb-stack-md">
        도시를 하나 선택한 다음, 아래 버튼으로 일정 만들기를 시작하세요.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {cities.map((city) => {
          const isSelected = selectedCity?.id === city.id;
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`group relative h-56 rounded-xl overflow-hidden traveler-glow transition-all ${
                isSelected ? "ring-4 ring-primary ring-offset-2 ring-offset-surface" : ""
              }`}
            >
              {city.imageUrl ? (
                <img
                  src={proxyImage(city.imageUrl) ?? undefined}
                  alt={city.nameKo}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-surface-container-low" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {isSelected && (
                <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">check</span>
                </span>
              )}
              <div className="absolute bottom-3 left-4 right-4 text-left">
                <p className="text-white text-headline-sm font-bold">{city.nameKo}</p>
                <p className="text-white/80 text-label-sm">{city.nameEn}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 도시를 선택하면 나타나는 하단 고정 액션바 */}
      {selectedCity && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant p-stack-md">
          <div className="max-w-container-max mx-auto flex items-center justify-between gap-stack-md px-margin-mobile md:px-margin-desktop">
            <p className="text-body-md font-bold truncate">
              <span className="text-on-surface-variant font-normal">선택한 도시: </span>
              {selectedCity.nameKo}
            </p>
            <button type="button" onClick={goPlanTrip} className="btn-primary shrink-0">
              {selectedCity.nameKo}로 일정 만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  accentBadge,
}: {
  icon: string;
  label: string;
  value: string;
  accentBadge: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${accentBadge}`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </span>
      <div className="min-w-0">
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <p className="text-label-md font-bold leading-snug">{value}</p>
      </div>
    </div>
  );
}
