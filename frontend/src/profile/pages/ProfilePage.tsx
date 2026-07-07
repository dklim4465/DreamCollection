import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuthStore } from "@/auth/store/authStore";
import { authApi } from "@/auth/api/authApi";
import { paymentApi } from "@/payment/api/paymentApi";
import { badgeApi } from "@/profile/api/badgeApi";
import { profileApi } from "@/profile/api/profileApi";
import UserBadgeChip from "@/common/component/UserBadgeChip";
import type { TravelStyle } from "@/types";

const TRAVEL_STYLE_LABEL: Record<TravelStyle, string> = {
  RELAXED: "휴식형",
  ACTIVE: "액티비티형",
  CULTURE: "문화탐방형",
  FOOD: "맛집탐방형",
  ADVENTURE: "모험형",
};

const TRAVEL_STYLE_OPTIONS = Object.keys(TRAVEL_STYLE_LABEL) as TravelStyle[];

/**
 * 마이페이지
 * - 프로필 정보 (+ 인라인 수정)
 * - 뱃지 목록 (클릭하면 대표 뱃지로 지정 → 닉네임 옆에 표시)
 * - 결제내역
 */
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImage ?? "");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(user?.travelStyle ?? "RELAXED");
  const [editError, setEditError] = useState<string | null>(null);

  const { data: paymentsRes } = useQuery({
    queryKey: ["payments", "history"],
    queryFn: paymentApi.getHistory,
    enabled: !!user,
  });

  const { data: badgesRes, isLoading: badgesLoading } = useQuery({
    queryKey: ["badges", "me"],
    queryFn: badgeApi.getMyBadges,
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      profileApi.updateMe({
        nickname: nickname !== user?.nickname ? nickname : undefined,
        profileImageUrl: profileImageUrl !== user?.profileImage ? profileImageUrl : undefined,
        travelStyle: travelStyle !== user?.travelStyle ? travelStyle : undefined,
      }),
    onSuccess: (res) => {
      const updated = res.data?.data;
      if (updated) updateUser(updated);
      setIsEditing(false);
      setEditError(null);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "프로필 수정에 실패했어요. 잠시 후 다시 시도해주세요.";
      setEditError(message);
    },
  });

  const setRepresentativeMutation = useMutation({
    mutationFn: (badgeId: number) => badgeApi.setRepresentative(badgeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["badges", "me"] });
      // 닉네임 옆 대표 뱃지 표시도 즉시 갱신하기 위해 유저 정보도 새로고침
      const me = await authApi.getMe();
      const meData = me.data?.data;
      if (meData) updateUser(meData);
    },
  });

  if (!user) return null;

  const payments = paymentsRes?.data?.data ?? [];
  const badges = badgesRes?.data?.data ?? [];

  const startEditing = () => {
    setNickname(user.nickname);
    setProfileImageUrl(user.profileImage ?? "");
    setTravelStyle(user.travelStyle);
    setEditError(null);
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col gap-stack-lg max-w-2xl">
      <h1 className="text-headline-md font-bold">마이페이지</h1>

      {/* 프로필 카드 */}
      <div className="card-base p-stack-lg flex flex-col gap-stack-md">
        <div className="flex items-center gap-stack-md">
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
            <div className="flex items-center gap-2">
              <p className="text-headline-sm font-bold">{user.nickname}</p>
              <UserBadgeChip badgeName={user.badgeName} badgeIconUrl={user.badgeIconUrl} />
            </div>
            <p className="text-body-md text-on-surface-variant">{user.email}</p>
            <span className="chip-tertiary mt-2 inline-block">
              내 여행스타일 · {TRAVEL_STYLE_LABEL[user.travelStyle]}
            </span>
          </div>
        </div>

        {/* 프로필 수정 폼 (인라인) */}
        {isEditing && (
          <div className="border-t border-outline-variant pt-stack-md flex flex-col gap-stack-sm">
            <div>
              <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-base w-full"
                maxLength={30}
              />
            </div>

            <div>
              <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">
                프로필 이미지 URL
              </label>
              <input
                type="text"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://..."
                className="input-base w-full"
              />
            </div>

            <div>
              <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">
                여행 스타일
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLE_OPTIONS.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTravelStyle(style)}
                    className={
                      travelStyle === style
                        ? "chip-primary"
                        : "chip-tertiary opacity-60 hover:opacity-100"
                    }
                  >
                    {TRAVEL_STYLE_LABEL[style]}
                  </button>
                ))}
              </div>
            </div>

            {editError && (
              <p className="text-label-sm text-error">{editError}</p>
            )}

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => updateProfileMutation.mutate()}
                disabled={updateProfileMutation.isPending || !nickname.trim()}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? "저장 중..." : "저장하기"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn-ghost text-sm py-2 px-5"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 뱃지 목록 */}
      <div className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-headline-sm font-bold">뱃지</h2>
          <span className="text-label-sm text-on-surface-variant">
            뱃지를 누르면 닉네임 옆 대표 뱃지로 지정돼요
          </span>
        </div>

        {badgesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                disabled={!badge.earned || setRepresentativeMutation.isPending}
                onClick={() => setRepresentativeMutation.mutate(badge.id)}
                title={badge.earned ? badge.description : `획득 조건: ${badge.description}`}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                  badge.representative
                    ? "border-primary bg-primary-container"
                    : badge.earned
                      ? "border-outline-variant hover:border-primary cursor-pointer"
                      : "border-outline-variant opacity-40 grayscale cursor-not-allowed"
                }`}
              >
                {badge.representative && (
                  <span className="absolute top-1 right-1 material-symbols-outlined text-primary text-[16px]">
                    check_circle
                  </span>
                )}
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                    military_tech
                  </span>
                </span>
                <p className="text-label-sm font-bold leading-snug">{badge.name}</p>
              </button>
            ))}
          </div>
        )}
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
        <button onClick={startEditing} className="nav-item justify-start">
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
