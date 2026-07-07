import { useEffect, useState } from "react";

export interface BannerSlide {
  imageUrl: string;
  eyebrow: string;
  title: string;
}

interface Props {
  slides: BannerSlide[];
  intervalMs?: number;
  heightClass?: string;
}

/**
 * 배경 사진 + 문구가 일정 시간마다 자동으로 전환되는 배너
 * 시작페이지 상단에서 시각적 포인트 + 분위기 전환 역할
 */
export default function VisualBanner({
  slides,
  intervalMs = 5000,
  heightClass = "h-44 md:h-64",
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  return (
    <section className={`relative rounded-3xl overflow-hidden ${heightClass}`}>
      {slides.map((slide, i) => (
        <div
          key={slide.imageUrl}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            <span className="text-white/80 text-label-sm uppercase tracking-wider mb-1">
              {slide.eyebrow}
            </span>
            <h2 className="text-white text-headline-md md:text-headline-lg font-bold drop-shadow">
              {slide.title}
            </h2>
          </div>
        </div>
      ))}

      {/* 인디케이터 */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((slide, i) => (
            <button
              key={slide.imageUrl}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번째 배너로 이동`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
