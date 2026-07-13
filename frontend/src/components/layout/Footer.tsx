import { Link } from "react-router-dom";

const LINKS = ["커뮤니티", "목적지", "고객지원", "개인정보처리방침"];

export default function Footer() {
  return (
    <footer className="bg-surface-container-high w-full py-stack-xl">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto gap-stack-lg">
        {/* 💡 shrink-0을 추가하여 화면이 줄어들어도 로고 영역이 찌그러지지 않게 고정합니다 */}
        <div className="flex flex-col items-center md:items-start gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Dream Collection 로고"
              className="h-8 w-auto object-contain"
            />
            <span className="text-headline-sm font-bold text-primary whitespace-nowrap">
              {/* 💡 whitespace-nowrap을 추가해 글자가 아래로 꺾이지 않게 합니다 */}
              Dream Collection
            </span>
          </div>
          <p className="text-body-md text-on-surface-variant">
            © 2026 Dream Collection. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-stack-lg">
          {/* ... 기존 코드 동일 ... */}
          {LINKS.map((label) => (
            <Link
              key={label}
              to="#"
              className="text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4 shrink-0">
         
          {["public", "mail"].map((icon) => (
            <button
              key={icon}
              className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}