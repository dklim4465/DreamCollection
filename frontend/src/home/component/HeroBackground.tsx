import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { mainHeroApi, type HeroMedia } from "@/home/api/mainHeroApi";

const SLIDE_INTERVAL_MS = 6000;

// 사진이 로드에 실패했을 때 대신 보여줄, 외부 의존성 없는 그라데이션 팔레트 (순환)
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", // 밤바다
  "linear-gradient(135deg, #ff9a44, #ea5f9b, #7b4397)", // 노을
  "linear-gradient(135deg, #134e5e, #71b280)", // 숲
  "linear-gradient(135deg, #1e3c72, #2a5298)", // 도시야경
];

/**
 * 콘텐츠 연동형 메인 배경 (동적 슬라이드)
 *
 * 백엔드 GET /api/main/background 가 우선순위를 전부 판단해서 내려줍니다.
 *  1) 로그인 + 다가오는 일정 있음 → 그 일정의 목적지 + D-day (단일 이미지)
 *  2) 로그인 + 일정 없음        → 이달의 여행지 (단일 이미지)
 *  3) 비로그인 또는 둘 다 없음   → 관리자 배경(medias) 여러 장을 자동으로 순환
 *
 * 이미지는 크로스페이드 + 은은한 Ken Burns(서서히 확대) 효과로 정적이지 않고
 * 살아있는 느낌을 주고, medias 중 하나가 영상(VIDEO)이면 자동재생 영상으로 보여줍니다.
 *
 * 이 API는 공개(비로그인도 호출 가능) 경로라, 로그인 여부와 무관하게 항상 안전하게 호출할 수 있습니다.
 */
export default function HeroBackground() {
  const { data, isLoading } = useQuery({
    queryKey: ["main", "background"],
    queryFn: mainHeroApi.getBackground,
    retry: false,
  });

  const hero = data?.data?.data;

  const slides: HeroMedia[] =
    hero && hero.medias.length > 0
      ? hero.medias
      : hero
        ? [{ url: hero.imageUrl, type: hero.mediaType }]
        : [];

  const [index, setIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const markFailed = (url: string) => {
    setFailedUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
  };

  useEffect(() => {
    setIndex(0);
  }, [hero?.mode, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading || slides.length === 0) {
    return (
      <section className="relative h-56 md:h-80 lg:h-96 rounded-[2rem] overflow-hidden bg-surface-container-high animate-pulse" />
    );
  }

  const title = hero?.title || "오늘은 어디로 떠나볼까요?";
  const cityLabel = hero?.mode === "SCHEDULE" || hero?.mode === "MONTHLY" ? hero.subtitle : null;
  const eyebrow =
    hero?.mode === "SCHEDULE"
      ? (hero.subtitle ?? "")
      : hero?.mode === "MONTHLY"
        ? "이달의 여행지"
        : "DREAM COLLECTION";

  const ctaLabel =
    hero?.mode === "SCHEDULE"
      ? "일정 상세보기"
      : hero?.mode === "MONTHLY"
        ? "여행지 보러가기"
        : "여행 계획 시작하기";

  const ctaTo =
    hero?.mode === "SCHEDULE" && hero.tripRequestId ? `/plan/${hero.tripRequestId}` : "/plan";

  return (
    <section className="relative h-56 md:h-80 lg:h-96 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]">
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30" />

      {/* 콘텐츠 */}
      <div key={`content-${index}`} className="relative h-full flex flex-col items-center justify-center text-center px-4">
        {cityLabel && hero?.mode === "SCHEDULE" && (
          <span className="flex items-center gap-1 text-white/90 text-label-sm mb-2 animate-[heroFadeUp_0.7s_ease-out]">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {cityLabel}
          </span>
        )}
        <span className="text-white/75 text-label-sm tracking-[0.2em] mb-2 animate-[heroFadeUp_0.7s_ease-out_0.05s_both]">
          {eyebrow}
        </span>
        <h2 className="text-white text-headline-lg md:text-[2.75rem] font-bold drop-shadow-lg mb-5 leading-tight animate-[heroFadeUp_0.7s_ease-out_0.12s_both]">
          {title}
        </h2>
        <Link
          to={ctaTo}
          className="btn-primary text-sm py-2.5 px-6 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] hover:scale-105 hover:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.6)] transition-all animate-[heroFadeUp_0.7s_ease-out_0.2s_both]"
        >
          {ctaLabel}
        </Link>
      </div>

      {/* 슬라이드 인디케이터 (배경이 여러 장일 때만) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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
