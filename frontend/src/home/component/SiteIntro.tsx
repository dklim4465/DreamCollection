import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cityApi } from "@/common/api/cityApi";
import { proxyImage } from "@/common/utils/proxyImage";

const FEATURES = [
  {
    icon: "auto_awesome",
    title: "AI가 여행 일정을 짜드려요",
    description: "목적지와 취향만 입력하면 나만의 일정을 추천해드려요.",
    ctaLabel: "일정 바로가기",
    ctaTo: "/trip/new",
  },
  {
    icon: "photo_library",
    title: "그동안 사진 정리하느라 힘드셨죠?",
    description: "여행지별, 날짜별로 자동 정리돼요. 흩어진 사진을 한 곳에 모아보세요.",
    ctaLabel: "나의기록 들어가기",
    ctaTo: "/records",
  },
  {
    icon: "cloud_done",
    title: "이젠 저희한테 보관하세요",
    description: "용량 걱정 없이 소중한 여행 기록을 안전하게 보관해드려요.",
    ctaLabel: "안전하게 보관하기",
    ctaTo: "/records",
  },
  {
    icon: "share",
    title: "그리고 친구들과 공유하세요",
    description: "링크 하나로 여행 앨범을 공유하고, 함께한 순간을 나눠보세요.",
    ctaLabel: "커뮤니티 둘러보기",
    ctaTo: "/community",
  },
];

/**
 * 서비스 소개 — 스크롤에 따라 카드가 하나씩 풀스크린으로 전환되는 스크롤텔링 섹션.
 * 페이지 최상단(히어로 자리)에 배치되어, 스크롤을 내리는 동안
 * "AI 일정 추천 → 사진 정리 → 보관 → 공유" 순서로 서비스 가치를 하나씩 보여준다.
 *
 * 배경 사진은 "지금 인기 있는 여행지"와 같은 데이터 소스를 재사용해서
 * (별도 API 호출 없음, 캐시 공유) 카드가 넘어갈 때마다 자연스럽게 바뀐다.
 */
export default function SiteIntro() {
  const { data } = useQuery({
    queryKey: ["cities", "popular"],
    queryFn: cityApi.getPopular,
    retry: false,
  });
  const cities = (data?.data?.data ?? []).filter((c) => !!c.imageUrl);

  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 섹션 진입 전/이후에는 각각 첫/마지막 카드로 고정
      const progress = -rect.top / (rect.height - vh);
      const clamped = Math.min(Math.max(progress, 0), 0.999);
      const nextIndex = Math.floor(clamped * FEATURES.length);
      setActive(Math.min(nextIndex, FEATURES.length - 1));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const markFailed = (i: number) => setFailedPhotos((prev) => new Set(prev).add(i));

  return (
    <section
      ref={sectionRef}
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen"
      style={{ height: `${FEATURES.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 배경: 인기 여행지 사진이 활성 카드에 맞춰 크로스페이드 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-tertiary">
          {cities.map((city, i) => (
            <img
              key={city.id}
              src={failedPhotos.has(i) ? undefined : (proxyImage(city.imageUrl) ?? undefined)}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i % cities.length === active % cities.length && !failedPhotos.has(i)
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              onError={() => markFailed(i)}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

        {/* 상단 고정 이름표 */}
        <div className="absolute top-24 left-0 right-0 text-center px-margin-mobile">
          <span className="text-white/80 text-label-sm tracking-[0.3em] uppercase">
            Dream Collection
          </span>
        </div>

        {/* 카드 콘텐츠: 활성 카드만 보이도록 크로스페이드 */}
        <div className="relative h-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center text-center">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`absolute inset-x-0 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto transition-all duration-700 ${
                i === active
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6 pointer-events-none"
              }`}
            >
              <span className="inline-flex w-16 h-16 rounded-full bg-white/15 items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-white">{f.icon}</span>
              </span>
              <h2 className="text-white text-[32px] md:text-[3rem] font-black leading-[1.05] mb-4">
                {f.title}
              </h2>
              <p className="text-white/85 text-body-md md:text-body-lg mb-8">
                {f.description}
              </p>
              <Link
                to={f.ctaTo}
                className="inline-flex items-center gap-2 bg-white text-on-surface text-sm font-bold py-4 px-8 rounded-full shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform"
              >
                {f.ctaLabel}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>

        {/* 진행 인디케이터 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {FEATURES.map((f, i) => (
            <span
              key={f.title}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-8 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* 스크롤 유도 힌트 (첫 카드에서만) */}
        {active === 0 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 animate-bounce">
            <span className="text-[11px] tracking-wide">scroll</span>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </div>
        )}
      </div>
    </section>
  );
}
