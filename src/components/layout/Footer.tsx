import { Link } from 'react-router-dom';

const LINKS = ['커뮤니티', '목적지', '고객지원', '개인정보처리방침'];

export default function Footer() {
  return (
    <footer className="bg-surface-container-high w-full py-stack-xl">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto gap-stack-lg">

        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-headline-sm font-bold text-primary">Traveler's Hub</span>
          <p className="text-body-md text-on-surface-variant">© 2024 Traveler's Hub. All rights reserved.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-stack-lg">
          {LINKS.map((label) => (
            <Link key={label} to="#"
              className="text-body-md text-on-surface-variant hover:text-primary transition-colors">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          {['public', 'mail'].map((icon) => (
            <button key={icon}
              className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
