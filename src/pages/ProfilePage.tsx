import { useAuthStore } from "@/store/authStore";
import type { TravelStyle } from "@/types";

const TRAVEL_STYLE_LABEL: Record<TravelStyle, string> = {
  RELAXED: "휴식형",
  ACTIVE: "액티비티형",
  CULTURE: "문화탐방형",
  FOOD: "맛집탐방형",
  ADVENTURE: "모험형",
};

/**
 * 마이페이지
 * TODO: 프로필 수정, 내 여행스타일 변경, 결제수단 관리 등 추가
 */
export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-stack-lg max-w-2xl">
      <h1 className="text-headline-md font-bold">마이페이지</h1>

      <div className="card-base p-stack-lg flex items-center gap-stack-md">
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
          <p className="text-headline-sm font-bold">{user.nickname}</p>
          <p className="text-body-md text-on-surface-variant">{user.email}</p>
          <span className="chip-tertiary mt-2 inline-block">
            내 여행스타일 · {TRAVEL_STYLE_LABEL[user.travelStyle]}
          </span>
        </div>
      </div>

      <div className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold mb-2">계정 관리</h2>
        <button className="nav-item justify-start">
          <span className="material-symbols-outlined">edit</span>
          프로필 수정
        </button>
        <button className="nav-item justify-start">
          <span className="material-symbols-outlined">credit_card</span>
          결제수단 관리
        </button>
        <button onClick={logout} className="nav-item justify-start text-error">
          <span className="material-symbols-outlined">logout</span>
          로그아웃
        </button>
      </div>
    </div>
  );
}
