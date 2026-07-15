import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { User, TravelStyle } from "@/types";
import { levelApi } from "@/profile/api/levelApi";
import { badgeApi } from "@/profile/api/badgeApi";

const TRAVEL_STYLE_LABEL: Record<TravelStyle, { label: string; icon: string }> =
  {
    RELAXED: { label: "휴식형", icon: "self_improvement" },
    ACTIVE: { label: "액티비티형", icon: "directions_run" },
    CULTURE: { label: "문화탐방형", icon: "museum" },
    FOOD: { label: "맛집탐방형", icon: "restaurant" },
    ADVENTURE: { label: "모험형", icon: "terrain" },
  };

interface Props {
  user: User;
}

/**
 * 닉네임/여행스타일만 있던 밋밋한 카드를 레벨, 뱃지 개수, "어떤 여행자인지" 해시태그로 채운다.
 * 해시태그는 여행 횟수(레벨)·뱃지 개수·여행스타일을 조합한 간단한 규칙 기반 요약이다.
 * (실제 Gemini 호출로 대체하려면 이 계산 로직을 백엔드 API 하나로 옮기면 됨 — 매 홈 진입마다
 *  LLM을 호출하면 응답 지연/비용이 커서, 우선은 즉시 응답되는 규칙 기반으로 구현)
 */
function buildTravelerHashtags(
  travelStyle: TravelStyle,
  tripCount: number,
  badgeCount: number,
): string[] {
  const tags = [`#${TRAVEL_STYLE_LABEL[travelStyle].label}`];

  if (tripCount >= 10) tags.push("#여행고수");
  else if (tripCount >= 3) tags.push("#여행러");
  else if (tripCount >= 1) tags.push("#여행초보탈출중");
  else tags.push("#첫여행준비중");

  if (badgeCount >= 5) tags.push("#뱃지콜렉터");
  else if (badgeCount >= 1) tags.push("#뱃지수집가");

  return tags.slice(0, 3);
}

export default function ProfileSummary({ user }: Props) {
  const style = TRAVEL_STYLE_LABEL[user.travelStyle];

  const { data: levelRes } = useQuery({
    queryKey: ["users", "me", "level"],
    queryFn: levelApi.getMyLevel,
    retry: false,
  });
  const { data: badgeRes } = useQuery({
    queryKey: ["badges", "me"],
    queryFn: badgeApi.getMyBadges,
    retry: false,
  });

  const level = levelRes?.data.data?.level ?? 1;
  const tripCount = levelRes?.data.data?.tripCount ?? 0;
  const badges = badgeRes?.data.data ?? [];
  const earnedBadgeCount = badges.filter((b) => b.earned).length;
  const representativeBadge = badges.find((b) => b.earned && b.representative);

  const hashtags = buildTravelerHashtags(user.travelStyle, tripCount, earnedBadgeCount);

  return (
    <section className="card-base p-stack-lg flex flex-col items-center text-center gap-stack-sm h-full">
      <div className="relative w-20 h-20 shrink-0">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-primary text-4xl">
              person
            </span>
          )}
        </div>
        {/* 레벨 뱃지 — 프로필 이미지 우하단에 겹쳐서 표시 */}
        <span className="absolute -bottom-1 -right-1 min-w-[26px] h-[26px] px-1 rounded-full bg-tertiary text-on-tertiary text-[11px] font-bold flex items-center justify-center border-2 border-surface">
          Lv.{level}
        </span>
      </div>

      <div>
        <p className="text-headline-sm font-bold">{user.nickname}님</p>
        <p className="text-label-sm text-on-surface-variant">
          {representativeBadge ? representativeBadge.name : "안녕하세요!"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-tertiary text-base">
          {style.icon}
        </span>
        <span className="chip-tertiary">내 여행스타일 · {style.label}</span>
      </div>

      {/* 어떤 여행자인지 한눈에 — 여행 횟수/뱃지 기반 해시태그 */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {hashtags.map((tag) => (
          <span key={tag} className="chip-primary text-[11px]">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-base">flight_takeoff</span>
          여행 {tripCount}회
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-base">workspace_premium</span>
          뱃지 {earnedBadgeCount}개
        </span>
      </div>

      <Link to="/profile" className="btn-ghost text-sm py-2 px-4 mt-auto w-full">
        마이페이지 바로가기
      </Link>
    </section>
  );
}
