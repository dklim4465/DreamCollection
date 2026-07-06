import { useEffect, useState } from "react";

/**
 * 화면을 일정 이상 스크롤하면 나타나는 우측 하단 "맨 위로" 버튼.
 * 모든 페이지에 공통으로 뜨도록 AppLayout에 배치한다.
 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로 이동"
      className="fixed right-8 md:right-10 bottom-28 md:bottom-10 w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface shadow-[0_8px_24px_-6px_rgba(0,0,0,0.3)] border border-outline-variant flex items-center justify-center hover:bg-surface-container-low hover:-translate-y-0.5 transition-all z-40"
    >
      <span className="material-symbols-outlined">keyboard_arrow_up</span>
    </button>
  );
}
