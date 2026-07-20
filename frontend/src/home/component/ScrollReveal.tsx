import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** 여러 섹션이 순서대로 나타나도록 살짝 다른 지연시간을 줄 때 사용 (ms) */
  delayMs?: number;
  className?: string;
}

/**
 * 스크롤로 화면에 들어오면 살짝 위로 올라오며 페이드인하는 홈페이지 섹션 래퍼.
 * IntersectionObserver로 한 번만 트리거하고(재방문 시 계속 깜빡이지 않게), 접근성을 위해
 * prefers-reduced-motion이면 애니메이션 없이 바로 보여준다.
 */
export default function ScrollReveal({ children, delayMs = 0, className = "" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
