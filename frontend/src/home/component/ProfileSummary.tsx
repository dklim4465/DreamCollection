import { Link } from "react-router-dom";
import type { User, TravelStyle } from "@/types";

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
 * 시작페이지 캘린더/BEST10과 나란히 놓이는 세로형 내 프로필 카드.
 * 닉네임, 프로필 이미지, 여행스타일을 보여줌
 */
export default function ProfileSummary({ user }: Props) {
  const style = TRAVEL_STYLE_LABEL[user.travelStyle];

  return (
    <section className="card-base p-stack-lg flex flex-col items-center text-center gap-stack-sm h-full">
      <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shrink-0">
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

      <div>
        <p className="text-headline-sm font-bold">{user.nickname}님</p>
        <p className="text-label-sm text-on-surface-variant">안녕하세요!</p>
      </div>

      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-tertiary text-base">
          {style.icon}
        </span>
        <span className="chip-tertiary">내 여행스타일 · {style.label}</span>
      </div>

      <Link to="/profile" className="btn-ghost text-sm py-2 px-4 mt-auto w-full">
        마이페이지 바로가기
      </Link>
    </section>
  );
}
