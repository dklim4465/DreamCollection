interface UserBadgeChipProps {
  badgeName?: string | null;
  badgeIconUrl?: string | null;
  size?: "sm" | "md";
}

/**
 * 닉네임 옆에 붙는 대표 뱃지 아이콘 — 대표 뱃지가 없으면 아무것도 렌더링하지 않음.
 *
 * 재사용 위치:
 *  - 상단 네비게이션(Navbar) "{닉네임}님 안녕하세요" 옆
 *  - 마이페이지 프로필 카드
 *  - (준비됨) 게시판/메이트 게시글의 작성자 닉네임 옆
 *    → author 정보에 badgeName/badgeIconUrl 필드가 포함되면 바로 이 컴포넌트로 연결하면 됨.
 *      board_post.author / mate_post.author API가 아직 없어서(게시판·메이트 도메인 미구현),
 *      지금은 여기까지만 준비해두고 실제 연결은 해당 도메인 구현 후 진행 필요.
 */
export default function UserBadgeChip({ badgeName, badgeIconUrl, size = "sm" }: UserBadgeChipProps) {
  if (!badgeName) return null;

  const dimension = size === "sm" ? "w-5 h-5" : "w-7 h-7";

  return (
    <span
      className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container rounded-full pl-1 pr-2 py-0.5"
      title={badgeName}
    >
      {badgeIconUrl ? (
        <img src={badgeIconUrl} alt={badgeName} className={`${dimension} rounded-full object-cover`} />
      ) : (
        <span className="material-symbols-outlined text-[16px]">military_tech</span>
      )}
      <span className="text-[11px] font-bold whitespace-nowrap">{badgeName}</span>
    </span>
  );
}
