import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/auth/store/authStore";
import { useThemeStore } from "@/common/store/themeStore";
import { levelApi } from "@/profile/api/levelApi";
import {
  notificationApi,
  type NotificationItem,
} from "@/mate/api/notificationApi";
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

function resolveNotificationLink(
  notification: NotificationItem,
): string | null {
  if (notification.targetId == null) return null;

  switch (notification.targetType) {
    case "MATE_POST":
      return `/matching/${notification.targetId}`;
    case "BOARD_POST":
      return `/community/${notification.targetId}`;
    default:
      return null;
  }
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { mode, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const { data: levelRes } = useQuery({
    queryKey: ["level", "me"],
    queryFn: levelApi.getMyLevel,
    enabled: isAuthenticated,
    retry: false,
  });
  const levelInfo = levelRes?.data?.data;

  const { data: unreadRes } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unreadCount = unreadRes?.data?.data ?? 0;

  const { data: notificationListRes } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationApi.getList(0, 10),
    enabled: isAuthenticated && notificationMenuOpen,
  });

  const notifications = Array.from(
    new Map(
      (notificationListRes?.data?.data?.content ?? [])
        .filter((n) => n.type !== "CHAT_MESSAGE")
        .map((n) => [n.id, n]),
    ).values(),
  );

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!notificationMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(e.target as Node)
      ) {
        setNotificationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationMenuOpen]);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    setProfileMenuOpen(false);
    navigate("/");
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      try {
        await notificationApi.markRead(notification.id);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch {
        // 읽음 처리 실패해도 이동은 계속 진행
      }
    }

    setNotificationMenuOpen(false);

    const link = resolveNotificationLink(notification);
    if (link) navigate(link);
  };

  return (
    <header id="top-bar" className="bg-surface sticky top-0 z-50 shadow-glow">
      <nav className="flex justify-between items-center w-full px-margin-desktop py-unit max-w-container-max mx-auto h-20">
        <Link to="/">
          <Logo />
        </Link>

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
            aria-label={
              mode === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
            }
            title={mode === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="material-symbols-outlined text-on-surface-variant hover:opacity-80"
          >
            {mode === "dark" ? "light_mode" : "dark_mode"}
          </button>

          {isAuthenticated && (
            <div className="relative" ref={notificationMenuRef}>
              <button
                type="button"
                onClick={() => setNotificationMenuOpen((v) => !v)}
                className="material-symbols-outlined text-on-surface-variant hover:opacity-80 relative"
              >
                notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-glow border border-outline-variant z-50">
                  {notifications.length === 0 ? (
                    <p className="text-label-md text-on-surface-variant text-center py-6">
                      알림이 없어요
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left px-4 py-3 border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low transition-colors ${
                          n.read ? "opacity-60" : ""
                        }`}
                      >
                        <p className="text-label-md text-on-surface">
                          {n.content}
                        </p>
                        <p className="text-label-sm text-outline mt-1">
                          {new Date(n.createdAt).toLocaleString("ko-KR")}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

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
                    <span className="material-symbols-outlined text-lg">
                      person
                    </span>
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-label-md text-error hover:bg-surface-container-low transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-lg">
                      logout
                    </span>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="btn-ghost text-sm py-2 px-4 whitespace-nowrap"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm py-2 px-4 whitespace-nowrap"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
