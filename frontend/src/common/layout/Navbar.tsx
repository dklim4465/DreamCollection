import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "@/auth/store/authStore";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/trip", icon: "calendar_month", label: "일정" },
  { to: "/records", icon: "photo_library", label: "나의기록" },
  { to: "/community", icon: "forum", label: "게시판" },
  { to: "/matching", icon: "group", label: "메이트찾기" },
  { to: "/notices", icon: "campaign", label: "공지사항" },
];

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header id="top-bar" className="bg-surface sticky top-0 z-50 shadow-glow">
      <nav className="flex justify-between items-center w-full px-margin-desktop py-unit max-w-container-max mx-auto h-20">
        {/* 로고 */}
        <Link to="/">
          <Logo />
        </Link>

        {/* 5대 메뉴 (일정/나의기록/게시판/메이트찾기/공지사항) */}
        <ul className="hidden lg:flex items-center gap-stack-lg">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-label-md font-bold transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* 검색 + 아이콘 + 마이페이지 */}
        <div className="flex items-center gap-stack-md">
          <SearchBar />

          {isAuthenticated && (
            <Link
              to="/cart"
              className="material-symbols-outlined text-on-surface-variant hover:opacity-80"
              aria-label="장바구니"
            >
              shopping_cart
            </Link>
          )}

          {isAuthenticated && user?.role === "ADMIN" && (
            <Link
              to="/admin"
              className="material-symbols-outlined text-on-surface-variant hover:opacity-80"
              aria-label="관리자 페이지"
              title="관리자 페이지"
            >
              admin_panel_settings
            </Link>
          )}

          <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80">
            notifications
          </button>

          {isAuthenticated ? (
            <Link to="/profile" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-primary text-lg">
                    person
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-label-md font-bold text-on-surface">
                마이페이지
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn-ghost text-sm py-2 px-4">
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
