import { Link } from "react-router-dom";

interface MenuCard {
  to: string;
  icon: string;
  title: string;
  description: string;
  colorClass: string; // 배경 강조색
}

const MAIN_MENUS: MenuCard[] = [
  {
    to: "/trip",
    icon: "calendar_month",
    title: "일정",
    description: "여행 일정을 등록하고 관리하세요",
    colorClass: "bg-primary",
  },
  {
    to: "/records",
    icon: "photo_library",
    title: "나의기록",
    description: "지난 여행의 추억을 모아보세요",
    colorClass: "bg-tertiary",
  },
  {
    to: "/community",
    icon: "forum",
    title: "게시판",
    description: "여행 팁과 후기를 나눠보세요",
    colorClass: "bg-secondary",
  },
  {
    to: "/matching",
    icon: "group",
    title: "메이트찾기",
    description: "함께할 여행 동행을 찾아보세요",
    colorClass: "bg-primary",
  },
];

/**
 * 시작페이지 4대 메뉴
 * 일정 / 나의기록 / 게시판 / 메이트찾기
 */
export default function MainMenuGrid() {
  return (
    <section>
      <h2 className="text-headline-md font-bold mb-stack-md">바로가기</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {MAIN_MENUS.map((menu) => (
          <Link
            key={menu.to}
            to={menu.to}
            className="card-interactive flex flex-col items-center justify-center gap-stack-sm p-stack-lg aspect-square text-center"
          >
            <div
              className={`w-16 h-16 rounded-2xl ${menu.colorClass} flex items-center justify-center text-white`}
            >
              <span className="material-symbols-outlined text-3xl">
                {menu.icon}
              </span>
            </div>
            <h3 className="text-headline-sm font-bold">{menu.title}</h3>
            <p className="text-label-md text-on-surface-variant hidden sm:block">
              {menu.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
