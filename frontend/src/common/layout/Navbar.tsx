import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/store/authStore";
import { useThemeStore } from "@/common/store/themeStore";
import { levelApi } from "@/profile/api/levelApi";
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
  const { isAuthenticated, user, logout } = useAuthStore();
  const { mode, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { data: levelRes } = useQuery({
    queryKey: ["level", "me"],
    queryFn: levelApi.getMyLevel,
    enabled: isAuthenticated,
    retry: false,
  });
  const levelInfo = levelRes?.data?.data;

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate("/");
  };

  return (
    <header id="top-bar" className="bg-surface sticky top-0 z-50 shadow-glow">
      <nav className="flex justify-between items-center w-full px-margin-desktop py-unit max-w-container-max mx-auto h-20">
        {/* 로고 */}
        <Link to="/">
          <Logo />
        </Link>

        {/* 5대 메뉴 (일정/나의기록/게시판/메이트찾기/공지사항) */}
        <ul className="hidden lg:flex items-center gap-3 xl:gap-stack-lg shrink-0">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="shrink-0">
              <NavLink
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 whitespace-nowrap text-label-md font-bold transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">
                  {item.icon}
                </span>
                <span className="hidden xl:inline">{item.label}</span>
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

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mode === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={mode === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="material-symbols-outlined text-on-surface-variant hover:opacity-80"
          >
            {mode === "dark" ? "light_mode" : "dark_mode"}
          </button>

          <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80">
            notifications
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shrink-0">
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
                <span className="hidden sm:inline text-label-md font-bold text-on-surface whitespace-nowrap">
                  {user?.nickname}님 안녕하세요
                </span>
                {levelInfo && (
                  <span className="chip-primary text-label-sm whitespace-nowrap">
                    Lv. {levelInfo.level}
                  </span>
                )}
                <span className="material-symbols-outlined text-on-surface-variant text-lg">
                  {profileMenuOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-glow border border-outline-variant overflow-hidden z-50">
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">person</span>
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-label-md text-error hover:bg-surface-container-low transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm py-2 px-4 whitespace-nowrap">
                로그인
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4 whitespace-nowrap">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
