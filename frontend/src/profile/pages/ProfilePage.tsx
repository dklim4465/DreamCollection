import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuthStore } from "@/auth/store/authStore";
import { paymentApi } from "@/payment/api/paymentApi";
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
 * - 프로필 정보
 * - 결제내역
 * TODO: 프로필 수정, 여행스타일 변경, 결제수단(카드) 관리
 */
export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  const { data: paymentsRes } = useQuery({
    queryKey: ["payments", "history"],
    queryFn: paymentApi.getHistory,
    enabled: !!user,
  });

  if (!user) return null;

  const payments = paymentsRes?.data?.data ?? [];

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

      {/* 결제내역 */}
      <div className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold mb-1">결제내역</h2>
        {payments.length === 0 ? (
          <p className="text-body-md text-on-surface-variant py-4">
            아직 결제 내역이 없어요
          </p>
        ) : (
          payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-2.5 border-b border-outline-variant last:border-none"
            >
              <div>
                <p className="text-body-md font-semibold">{p.scheduleTitle}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {dayjs(p.paidAt).format("YYYY.MM.DD HH:mm")} ·{" "}
                  {p.method === "CARD" ? "카드결제" : "간편결제"}
                </p>
              </div>
              <span className="text-body-md font-bold">
                {p.amount.toLocaleString("ko-KR")}원
              </span>
            </div>
          ))
        )}
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
