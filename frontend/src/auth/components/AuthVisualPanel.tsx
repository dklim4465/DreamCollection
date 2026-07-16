import type { CSSProperties } from "react";

// 실제 시딩 데이터(도시/공항)에 등장하는 여행지를 여권 스탬프처럼 배치한다.
// → "가입하면 이런 곳들의 도장을 모을 수 있어요"라는 배지/도감 기능과 자연스럽게 연결.
interface StampConfig {
  code: string;
  city: string;
  rotate: number;
  size: "sm" | "md" | "lg";
  position: string; // tailwind 절대 위치 클래스
}

const STAMPS: StampConfig[] = [
  { code: "NRT", city: "TOKYO", rotate: -8, size: "lg", position: "top-[6%] left-[8%]" },
  { code: "KIX", city: "OSAKA", rotate: 11, size: "md", position: "top-[24%] right-[6%]" },
  { code: "BKK", city: "BANGKOK", rotate: -6, size: "md", position: "bottom-[24%] left-[4%]" },
  { code: "JFK", city: "NEW YORK", rotate: 8, size: "sm", position: "bottom-[8%] right-[14%]" },
  { code: "FUK", city: "FUKUOKA", rotate: -13, size: "sm", position: "top-[50%] left-[38%]" },
];

const SIZE_MAP: Record<StampConfig["size"], { box: string; code: string }> = {
  lg: { box: "w-28 h-28", code: "text-2xl" },
  md: { box: "w-24 h-24", code: "text-xl" },
  sm: { box: "w-20 h-20", code: "text-lg" },
};

export default function AuthVisualPanel() {
  return (
    <>
      {STAMPS.map((stamp) => {
        const { box, code } = SIZE_MAP[stamp.size];
        return (
          <div
            key={stamp.code}
            className={`auth-stamp absolute ${box} ${stamp.position}`}
            style={{ "--stamp-rotate": `${stamp.rotate}deg` } as CSSProperties}
          >
            <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full border-2 border-dashed border-white/60 text-white/90">
              <span className="material-symbols-outlined text-sm leading-none opacity-80">
                flight_takeoff
              </span>
              <span className={`font-display font-semibold tracking-wide ${code}`}>
                {stamp.code}
              </span>
              <span className="text-[9px] tracking-[0.2em] opacity-75">{stamp.city}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
