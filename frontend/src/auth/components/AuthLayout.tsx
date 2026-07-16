import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import AuthVisualPanel from "./AuthVisualPanel";

interface AuthLayoutProps {
  /** 좌측 패널 상단의 작은 라벨, 예: "TRAVELER'S HUB" */
  eyebrow: string;
  /** 세리프 대제목 (여권/스탬프 톤) */
  title: ReactNode;
  /** 대제목 아래 보조 설명 */
  description: string;
  /** 좌측 하단에 표시할 강조 수치, 예: { value: "47", label: "개국의 여행 도장을 모을 수 있어요" } */
  highlight?: { value: string; label: string };
  /** 우측 폼 영역 */
  children: ReactNode;
}

export default function AuthLayout({
  eyebrow,
  title,
  description,
  highlight,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-[minmax(0,44%)_1fr]">
      {/* ───────── 좌측: 비주얼 패널 (lg 이상에서만 노출, 스크롤 시 고정) ───────── */}
      <div className="relative hidden overflow-hidden px-12 py-14 auth-visual-bg lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:self-start">
        <div className="pointer-events-none absolute inset-0">
          <AuthVisualPanel />
        </div>

        <Link
          to="/"
          className="relative z-10 w-fit text-label-md font-bold uppercase tracking-[0.3em] text-white/80 hover:text-white transition-colors"
        >
          Traveler&apos;s Hub
        </Link>

        <div className="relative z-10 max-w-sm">
          <p className="mb-3 text-label-sm uppercase tracking-[0.3em] text-white/60">{eyebrow}</p>
          <h2 className="font-display text-4xl leading-tight text-white">{title}</h2>
          <p className="mt-4 text-body-md text-white/75">{description}</p>

          {highlight && (
            <div className="mt-8 flex items-center gap-4 border-t border-white/20 pt-6">
              <span className="font-display text-3xl text-white">{highlight.value}</span>
              <span className="max-w-[11rem] text-label-sm text-white/70">{highlight.label}</span>
            </div>
          )}
        </div>

        <div className="auth-divider" aria-hidden />
      </div>

      {/* ───────── 우측: 실제 폼 영역 ───────── */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        {/* 모바일 전용 헤더 — 좌측 패널이 숨겨지는 화면에서 브랜드 톤 유지 */}
        <div className="mx-auto mb-8 w-full max-w-md lg:hidden">
          <p className="mb-2 text-label-sm uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
          <h1 className="font-display text-3xl text-on-background">{title}</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">{description}</p>
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
