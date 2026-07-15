import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cityApi } from "@/common/api/cityApi";
import { proxyImage } from "@/common/utils/proxyImage";
import { getDestinationInfo } from "@/destination/data/destinationInfo";

// 도시의 timezone으로 현재 현지 시각을 1분마다 갱신해서 보여준다.
function useLocalTime(timezone: string | null) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!timezone) return null;
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  } catch {
    return null;
  }
}

export default function CityDetailPage() {
  const { cityId } = useParams<{ cityId: string }>();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["city", "detail", cityId],
    queryFn: () => cityApi.getDetail(cityId!),
    enabled: !!cityId,
    retry: false,
  });

  const detail = data?.data?.data;
  const city = detail?.city;
  const info = city ? getDestinationInfo(city.nameKo) : null;
  const localTime = useLocalTime(city?.timezone ?? null);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="h-80 rounded-3xl bg-surface-container-low animate-pulse mb-stack-lg" />
        <div className="h-40 rounded-2xl bg-surface-container-low animate-pulse" />
      </div>
    );
  }

  if (isError || !city) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-body-md text-on-surface-variant mb-stack-md">
          여행지를 찾을 수 없어요.
        </p>
        <Link to="/" className="btn-primary">
          홈으로
        </Link>
      </div>
    );
  }

  const gallery = info?.gallery?.length ? info.gallery : city.imageUrl ? [city.imageUrl] : [];
  const heroSrc = gallery[0] ? proxyImage(gallery[0]) : null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── 히어로 ── */}
      <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden traveler-glow mb-stack-lg">
        {heroSrc ? (
          <img src={heroSrc} alt={city.nameKo} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-surface-container-low" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-stack-lg text-white">
          <p className="text-label-sm uppercase tracking-[0.2em] opacity-80 mb-1">
            {city.countryName}
          </p>
          <h1 className="text-display-lg-mobile md:text-display-lg font-bold mb-2">
            {city.nameKo}
          </h1>
          {info?.tagline && <p className="text-body-lg opacity-90">{info.tagline}</p>}
          <div className="flex gap-2 mt-stack-md">
            <Link
              to={`/trip/new?destination=${encodeURIComponent(city.nameKo)}`}
              className="btn-primary"
            >
              이 도시로 일정 만들기
            </Link>
            <Link to="/matching" className="btn-ghost bg-white/10 border-white/40 text-white hover:bg-white hover:text-on-surface">
              메이트 찾기
            </Link>
          </div>
        </div>
      </div>

      {/* ── 국가 / 여행 정보 ── */}
      <section className="card-base p-stack-lg mb-stack-lg">
        <h2 className="text-headline-sm font-bold mb-stack-md">여행 전 알아두면 좋은 정보</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-stack-md mb-stack-md">
          <InfoItem icon="schedule" label="현지 시각" value={localTime ?? (info?.timeDiff || "정보 없음")} />
          <InfoItem icon="payments" label="화폐" value={info?.currency ?? "정보 없음"} />
          <InfoItem icon="translate" label="언어" value={info?.language ?? "정보 없음"} />
          <InfoItem icon="power" label="전압/플러그" value={info?.plugType ?? "정보 없음"} />
          <InfoItem icon="badge" label="비자" value={info?.visa ?? "여행 전 최신 비자 정책을 확인하세요"} />
          <InfoItem icon="calendar_month" label="여행 적기" value={info?.bestSeason ?? "정보 없음"} />
        </div>

        {info?.tips && info.tips.length > 0 && (
          <div className="pt-stack-md border-t border-outline-variant">
            <p className="text-label-md font-bold mb-2">여행 팁</p>
            <ul className="flex flex-col gap-1.5">
              {info.tips.map((tip, i) => (
                <li key={i} className="text-body-sm text-on-surface-variant flex gap-2">
                  <span className="material-symbols-outlined text-primary text-base shrink-0">check_circle</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── 사진 갤러리 ── */}
      {gallery.length > 0 && (
        <section className="mb-stack-lg">
          <h2 className="text-headline-sm font-bold mb-stack-md">{city.nameKo} 갤러리</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((src, i) => {
              const proxied = proxyImage(src);
              if (!proxied) return null;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxSrc(proxied)}
                  className="relative h-40 md:h-48 rounded-xl overflow-hidden group"
                >
                  <img
                    src={proxied}
                    alt={`${city.nameKo} 사진 ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 같은 나라의 다른 여행지 ── */}
      {detail && detail.sameCountryCities.length > 0 && (
        <section className="mb-stack-lg">
          <h2 className="text-headline-sm font-bold mb-stack-md">
            {city.countryName}의 다른 여행지
          </h2>
          <div className="flex flex-wrap gap-2">
            {detail.sameCountryCities.map((c) => (
              <Link key={c.id} to={`/destinations/${c.id}`} className="chip-primary hover:opacity-80 transition-opacity">
                {c.nameKo}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 라이트박스 ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center px-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            aria-label="닫기"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightboxSrc(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img src={lightboxSrc} alt="" className="max-w-full max-h-[85vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <div>
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <p className="text-body-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
