import { Link } from "react-router-dom";

interface MenuCard {
  to: string;
  icon: string;
  title: string;
}

const MAIN_MENUS: MenuCard[] = [
  { to: "/plan", icon: "calendar_month", title: "일정" },
  { to: "/records", icon: "photo_library", title: "나의기록" },
  { to: "/community", icon: "forum", title: "게시판" },
  { to: "/matching", icon: "group", title: "메이트찾기" },
  { to: "/notices", icon: "campaign", title: "공지사항" },
];

/**
 * 시작페이지 바로가기 5대 메뉴
 * 일정 / 나의기록 / 게시판 / 메이트찾기 / 공지사항(전용 페이지로 이동)
 * 제목 텍스트 없이 카드만 노출 (홈페이지에서 상단에 딱 붙여서 사용)
 */
export default function QuickLinksBar() {
  return (
    <div className="card-base shadow-glow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-y divide-outline-variant md:divide-y-0 md:divide-x">
      {MAIN_MENUS.map((menu) => (
        <Link
          key={menu.to}
          to={menu.to}
          className="group flex flex-col items-center justify-center gap-2 py-stack-lg px-stack-md text-center hover:bg-surface-container-low transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container transition-transform duration-300 group-hover:scale-110">
            <span className="material-symbols-outlined text-2xl">
              {menu.icon}
            </span>
          </div>
          <h3 className="text-label-md font-bold">{menu.title}</h3>
        </Link>
      ))}
    </div>
  );
}
