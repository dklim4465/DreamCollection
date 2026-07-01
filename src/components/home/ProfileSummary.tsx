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
 * 로그인 시 시작페이지 상단에 노출되는 내 프로필 카드
 * 닉네임, 프로필 이미지, 여행스타일을 보여줌
 */
export default function ProfileSummary({ user }: Props) {
  const style = TRAVEL_STYLE_LABEL[user.travelStyle];

  return (
    <section className="card-base p-stack-lg flex items-center justify-between gap-stack-md flex-wrap">
      <div className="flex items-center gap-stack-md">
        <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shrink-0">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-primary text-3xl">
              person
            </span>
          )}
        </div>
        <div>
          <p className="text-headline-sm font-bold">
            {user.nickname}님, 안녕하세요!
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-tertiary text-base">
              {style.icon}
            </span>
            <span className="chip-tertiary">내 여행스타일 · {style.label}</span>
          </div>
        </div>
      </div>

      <Link to="/profile" className="btn-ghost text-sm py-2 px-4 shrink-0">
        마이페이지 바로가기
      </Link>
    </section>
  );
}
