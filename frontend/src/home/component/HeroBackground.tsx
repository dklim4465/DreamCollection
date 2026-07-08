import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { mainHeroApi } from "@/home/api/mainHeroApi";
import { cityApi } from "@/common/api/cityApi";

const SLIDE_INTERVAL_MS = 5000;

// 사진이 로드에 실패했을 때 대신 보여줄, 외부 의존성 없는 그라데이션 팔레트 (순환)
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", // 밤바다
  "linear-gradient(135deg, #ff9a44, #ea5f9b, #7b4397)", // 노을
  "linear-gradient(135deg, #134e5e, #71b280)", // 숲
  "linear-gradient(135deg, #1e3c72, #2a5298)", // 도시야경
];

// 도시마다 다른 느낌으로 보이도록 돌려쓰는 문구 템플릿
const CAPTION_TEMPLATES = [
  (city: string) => `${city}, 지금 떠나볼까요?`,
  (city: string) => `${city}에서 만나는 특별한 하루`,
  (city: string) => `이번엔 ${city} 어때요?`,
  (city: string) => `${city} 여행, 준비되셨나요?`,
];

interface Slide {
  url: string;
  type: "IMAGE" | "VIDEO";
  title?: string | null;
  subtitle?: string | null; // 국가명 등 보조 라벨
  ctaTo?: string;
}

/**
 * 콘텐츠 연동형 메인 배경 (동적 슬라이드)
 *
 *  1) 로그인 + 다가오는 일정 있음 → 그 일정의 목적지 + D-day (단일 이미지, 백엔드 응답 그대로 사용)
 *  2) 그 외 모든 경우            → "지금 인기 있는 여행지"(city 마스터, 아래 섹션과 동일한 데이터 소스)의
 *                                   사진 + 도시명을 그대로 가져와 5초 간격으로 순환 노출
 *
 * 이미지는 크로스페이드 + 은은한 Ken Burns(서서히 확대) 효과로 살아있는 느낌을 준다.
 */
export default function HeroBackground() {
  const { data } = useQuery({
    queryKey: ["main", "background"],
    queryFn: mainHeroApi.getBackground,
    retry: false,
  });
  const hero = data?.data?.data;

  const { data: cityData, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", "popular"],
    queryFn: cityApi.getPopular,
    retry: false,
  });
  const cities = cityData?.data?.data ?? [];

  const isSchedule = hero?.mode === "SCHEDULE";

  const citySlides: Slide[] = cities
    .filter((city) => !!city.imageUrl)
    .map((city, i) => ({
      url: city.imageUrl as string,
      type: "IMAGE",
      title: CAPTION_TEMPLATES[i % CAPTION_TEMPLATES.length](city.nameKo),
      subtitle: city.countryName,
      ctaTo: `/trip/new?destination=${encodeURIComponent(city.nameKo)}`,
    }));

  const slides: Slide[] = isSchedule
    ? hero
      ? [{ url: hero.imageUrl, type: hero.mediaType as "IMAGE" | "VIDEO" }]
      : []
    : citySlides.length > 0
      ? citySlides
      : hero && hero.medias.length > 0
        ? hero.medias
        : hero
          ? [{ url: hero.imageUrl, type: hero.mediaType as "IMAGE" | "VIDEO" }]
          : [];

  const [index, setIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const markFailed = (url: string) => {
    setFailedUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
  };

  useEffect(() => {
    // 페이지에 들어올 때마다 랜덤한 슬라이드부터 시작 (매번 다른 여행지가 먼저 보이도록)
    if (slides.length === 0) return;
    setIndex(Math.floor(Math.random() * slides.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero?.mode, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const isLoading = !hero && (citiesLoading || cities.length === 0);

  if (isLoading || slides.length === 0) {
    return (
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden bg-surface-container-high animate-pulse" />
    );
  }

  const currentSlide = slides[index];

  const title = isSchedule
    ? hero?.title || "오늘은 어디로 떠나볼까요?"
    : currentSlide?.title || "오늘은 어디로 떠나볼까요?";

  const cityLabel = isSchedule ? hero?.subtitle : currentSlide?.subtitle;

  const eyebrow = isSchedule ? (hero?.subtitle ?? "") : "지금 인기 있는 여행지";

  const ctaLabel = isSchedule ? "일정 상세보기" : "이 여행지로 계획 세우기";

  const ctaTo = isSchedule
    ? hero?.tripRequestId
      ? "/trip"
      : "/trip"
    : (currentSlide?.ctaTo ?? "/trip/new");

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden">
      {/* 슬라이드 */}
      {slides.map((slide, i) => {
        const failed = failedUrls.has(slide.url);
        return (
          <div
            key={`${slide.url}-${i}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {failed ? (
              // 이미지/영상 로드 실패 시 깨진 화면 대신 은은하게 움직이는 그라데이션으로 대체
              <div
                className="absolute inset-0 w-full h-full bg-[length:200%_200%]"
                style={{
                  backgroundImage: FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
                  animation: i === index ? "heroGradientShift 8s ease-in-out infinite" : undefined,
                }}
              />
            ) : slide.type === "VIDEO" ? (
              <video
                src={slide.url}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                onError={() => markFailed(slide.url)}
              />
            ) : (
              <img
                src={slide.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  animation:
                    i === index
                      ? `heroKenBurns ${SLIDE_INTERVAL_MS + 1200}ms ease-out forwards`
                      : undefined,
                }}
                onError={() => markFailed(slide.url)}
              />
            )}
          </div>
        );
      })}

      {/* 은은한 비네트 + 하단 그라데이션으로 텍스트 가독성 확보 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30" />

      {/* 콘텐츠 */}
      <div
        key={`content-${index}`}
        className="relative h-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center text-center"
      >
        {cityLabel && (
          <span className="flex items-center gap-1 text-white/90 text-label-sm mb-2 animate-[heroFadeUp_0.7s_ease-out]">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {cityLabel}
          </span>
        )}
        <span className="text-white/75 text-label-sm tracking-[0.2em] mb-3 animate-[heroFadeUp_0.7s_ease-out_0.05s_both]">
          {eyebrow}
        </span>
        <h2 className="text-white text-[32px] md:text-[3.25rem] font-bold drop-shadow-lg mb-6 leading-tight max-w-3xl animate-[heroFadeUp_0.7s_ease-out_0.12s_both]">
          {title}
        </h2>
        <Link
          to={ctaTo}
          className="btn-primary text-sm py-3 px-8 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] hover:scale-105 hover:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.6)] transition-all animate-[heroFadeUp_0.7s_ease-out_0.2s_both]"
        >
          {ctaLabel}
        </Link>
      </div>

      {/* 슬라이드 인디케이터 (배경이 여러 장일 때만) */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((slide, i) => (
            <button
              key={`${slide.url}-dot-${i}`}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번째 배경으로 이동`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes heroKenBurns {
          from { transform: scale(1); }
          to { transform: scale(1.09); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}
