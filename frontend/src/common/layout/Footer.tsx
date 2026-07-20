import { Link } from "react-router-dom";

// 실제로 존재하는 페이지가 있는 것만 링크를 걸고, 나머지는 "#"로 남겨둠
// (예전엔 전부 "#"였는데, 고객지원은 이번에 만든 문의하기 페이지로 실제 연결함)
const LINKS: { label: string; to: string }[] = [
  { label: "커뮤니티", to: "/community" },
  { label: "목적지", to: "#" },
  { label: "고객지원", to: "/feedback" },
  { label: "개인정보처리방침", to: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-container-high w-full py-stack-xl">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto gap-stack-lg">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <img
              src="/logo-icon-only.png"
              alt="Dream Collection 로고"
              className="h-8 w-auto object-contain"
            />
            <span className="text-headline-sm font-bold text-primary">
              Dream Collection
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant">
            © 2026 Dream Collection. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-stack-lg">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="맨 위로"
            className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">public</span>
          </button>
          <Link
            to="/feedback"
            aria-label="문의하기"
            title="문의하기"
            className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">mail</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
