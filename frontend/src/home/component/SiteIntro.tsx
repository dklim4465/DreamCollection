import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SLIDE_INTERVAL_MS = 4000; 

const FEATURES = [
  {
    icon: "auto_awesome",
    title: "AI가 여행 일정을 짜드려요",
    description: "목적지와 취향만 입력하면 나만의 일정을 추천해드려요.",
    ctaLabel: "일정 바로가기",
    ctaTo: "/trip/new",
    image: "/images/site-intro/feature-1-ai-planner.jpg",
  },
  {
    icon: "photo_library",
    title: "그동안 사진 정리하느라 힘드셨죠?",
    description: "여행지별, 날짜별로 자동 정리돼요. 흩어진 사진을 한 곳에 모아보세요.",
    ctaLabel: "나의기록 들어가기",
    ctaTo: "/records",
    image: "/images/site-intro/feature-2-photo-organize.jpg",
  },
  {
    icon: "cloud_done",
    title: "이젠 저희한테 보관하세요",
    description: "용량 걱정 없이 소중한 여행 기록을 안전하게 보관해드려요.",
    ctaLabel: "안전하게 보관하기",
    ctaTo: "/records",
    image: "/images/site-intro/feature-3-storage.jpg",
  },
  {
    icon: "share",
    title: "그리고 친구들과 공유하세요",
    description: "링크 하나로 여행 앨범을 공유하고, 함께한 순간을 나눠보세요.",
    ctaLabel: "커뮤니티 둘러보기",
    ctaTo: "/community",
    image: "/images/site-intro/feature-4-share.jpg",
  },
];

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #ff9a44, #ea5f9b, #7b4397)",
  "linear-gradient(135deg, #134e5e, #71b280)",
  "linear-gradient(135deg, #1e3c72, #2a5298)",
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
];


export default function SiteIntro() {
  const [index, setIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FEATURES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const markFailed = (i: number) => setFailedPhotos((prev) => new Set(prev).add(i));

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[520px] md:h-[640px] lg:h-[720px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-tertiary">
        {FEATURES.map((f, i) =>
          failedPhotos.has(i) ? (
            <div
              key={f.title}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length] }}
            />
          ) : (
            <img
              key={f.title}
              src={f.image}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              onError={() => markFailed(i)}
            />
          )
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
      <div className="absolute top-24 left-0 right-0 text-center px-margin-mobile">
        <span className="text-white/80 text-label-sm tracking-[0.3em] uppercase">
          Dream Collection
        </span>
      </div>
      <div className="relative h-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center justify-center text-center">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`absolute inset-x-0 px-margin-mobile md:px-margin-desktop max-w-2xl mx-auto transition-all duration-700 ${
              i === index
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
  className="inline-flex items-center gap-2 bg-white text-neutral-900 text-sm font-bold py-4 px-8 rounded-full shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform"
>
              {f.ctaLabel}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {FEATURES.map((f, i) => (
          <button
            key={f.title}
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}번째 소개로 이동`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
}