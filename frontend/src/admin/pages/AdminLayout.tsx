import { NavLink, Outlet } from "react-router-dom";

const MENUS = [
  { to: "/admin/dashboard", label: "홈 화면 미리보기", icon: "dashboard" },
  { to: "/admin/banners", label: "배너", icon: "campaign" },
  { to: "/admin/main-backgrounds", label: "메인 배경", icon: "wallpaper" },
  { to: "/admin/notices", label: "공지사항", icon: "campaign" },
  { to: "/admin/monthly-destinations", label: "이달의 여행지", icon: "travel_explore" },
  { to: "/admin/board", label: "게시판 관리", icon: "forum" },
  { to: "/admin/feedback", label: "문의 내역", icon: "mail" },
  { to: "/admin/users", label: "회원 관리", icon: "group" },
];

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-gutter">
      <aside className="card-base p-stack-md h-fit">
        <p className="text-label-sm text-on-surface-variant px-2 mb-2">관리자 메뉴</p>
        <nav className="flex flex-col gap-1">
          {MENUS.map((menu) => (
            <NavLink
              key={menu.to}
              to={menu.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-body-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : "text-on-surface hover:bg-surface-container-low"
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{menu.icon}</span>
              {menu.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
