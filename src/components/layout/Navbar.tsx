import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="bg-surface sticky top-0 z-50 shadow-glow">
      <nav className="flex justify-between items-center w-full px-margin-desktop py-unit max-w-container-max mx-auto h-20">

        {/* 로고 + 상단 메뉴 */}
        <div className="flex items-center gap-stack-lg">
          <Link to="/" className="text-headline-md font-extrabold text-primary">
            Traveler's Hub
          </Link>
          <div className="hidden md:flex items-center gap-stack-md ml-stack-lg">
            {[
              { to: '/',          label: '홈' },
              { to: '/community', label: '커뮤니티' },
              { to: '/matching',  label: '탐색' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} end
                className={({ isActive }) =>
                  `text-label-md transition-opacity py-1 ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:opacity-80'
                  }`
                }>
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* 검색 + 아이콘 */}
        <div className="flex items-center gap-stack-md">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="여행지 검색..."
              className="input-search"
            />
          </div>

          <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80">
            notifications
          </button>

          {isAuthenticated ? (
            <Link to="/profile">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                {user?.profileImage
                  ? <img src={user.profileImage} alt={user.nickname} className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-primary text-lg">person</span>
                }
              </div>
            </Link>
          ) : (
            <Link to="/login" className="btn-ghost text-sm py-2 px-4">로그인</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
