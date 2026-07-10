import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuthStore } from "@/auth/store/authStore";
import { paymentApi } from "@/payment/api/paymentApi";
import { paymentCardApi } from "@/payment/api/paymentCardApi";
import { levelApi } from "@/profile/api/levelApi";
import { profileApi } from "@/profile/api/profileApi";
import { deviceApi } from "@/profile/api/deviceApi";
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
 * - 레벨 시스템 (여행 횟수 기준)
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
  const [showCardManager, setShowCardManager] = useState(false);
  const [showLoginActivity, setShowLoginActivity] = useState(false);

  const { data: paymentsRes } = useQuery({
    queryKey: ["payments", "history"],
    queryFn: paymentApi.getHistory,
    enabled: !!user,
  });

  const { data: levelRes, isLoading: levelLoading } = useQuery({
    queryKey: ["level", "me"],
    queryFn: levelApi.getMyLevel,
    enabled: !!user,
  });

  // 결제수단 관리 패널을 열었을 때만 조회
  const { data: cardsRes, isLoading: cardsLoading } = useQuery({
    queryKey: ["payment-cards", "me"],
    queryFn: paymentCardApi.getMyCards,
    enabled: !!user && showCardManager,
  });

  const deleteCardMutation = useMutation({
    mutationFn: paymentCardApi.deleteCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment-cards", "me"] }),
  });

  const setDefaultCardMutation = useMutation({
    mutationFn: paymentCardApi.setDefaultCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment-cards", "me"] }),
  });

  // 로그인 활동 패널을 열었을 때만 조회
  const { data: loginHistoryRes, isLoading: loginHistoryLoading } = useQuery({
    queryKey: ["login-history", "me"],
    queryFn: deviceApi.getLoginHistory,
    enabled: !!user && showLoginActivity,
  });

  const { data: devicesRes, isLoading: devicesLoading } = useQuery({
    queryKey: ["devices", "me"],
    queryFn: deviceApi.getMyDevices,
    enabled: !!user && showLoginActivity,
  });

  const revokeDeviceMutation = useMutation({
    mutationFn: deviceApi.revokeDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["devices", "me"] }),
  });

  const revokeAllDevicesMutation = useMutation({
    mutationFn: deviceApi.revokeAllDevices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices", "me"] });
      // 지금 이 기기도 함께 로그아웃 처리됨
      logout();
    },
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

  if (!user) return null;

  const payments = paymentsRes?.data?.data ?? [];
  const levelInfo = levelRes?.data?.data;
  const cards = cardsRes?.data?.data ?? [];
  const loginHistory = loginHistoryRes?.data?.data ?? [];
  const devices = devicesRes?.data?.data ?? [];

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
              {levelLoading ? (
                <span className="chip-tertiary opacity-50">Lv. -</span>
              ) : levelInfo ? (
                <span className="chip-primary">Lv. {levelInfo.level}</span>
              ) : null}
            </div>
            <p className="text-body-md text-on-surface-variant">{user.email}</p>
            <span className="chip-tertiary mt-2 inline-block">
              내 여행스타일 · {TRAVEL_STYLE_LABEL[user.travelStyle]}
            </span>

            {levelInfo && (
              <div className="mt-3 max-w-xs">
                {levelInfo.nextLevelTripCount !== null ? (
                  <>
                    <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                      <span>여행 {levelInfo.tripCount}회</span>
                      <span>
                        다음 레벨까지 {levelInfo.tripsToNextLevel}회 남음
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (levelInfo.tripCount / levelInfo.nextLevelTripCount) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-label-sm text-primary font-bold">
                    최고 레벨 달성! (여행 {levelInfo.tripCount}회)
                  </p>
                )}
              </div>
            )}
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
        <button
          onClick={() => setShowCardManager((v) => !v)}
          className="nav-item justify-start"
        >
          <span className="material-symbols-outlined">credit_card</span>
          결제수단 관리
        </button>

        {showCardManager && (
          <div className="border-t border-outline-variant pt-stack-sm pl-2 flex flex-col gap-2">
            {cardsLoading ? (
              <p className="text-label-sm text-on-surface-variant py-2">불러오는 중...</p>
            ) : cards.length === 0 ? (
              <p className="text-label-sm text-on-surface-variant py-2">
                등록된 결제수단이 없어요
              </p>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between py-2 border-b border-outline-variant last:border-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-body-md">
                      {card.cardCompany ?? "카드"} ****{card.cardLast4}
                    </span>
                    {card.isDefault && <span className="chip-primary text-label-sm">기본</span>}
                  </div>
                  <div className="flex gap-2">
                    {!card.isDefault && (
                      <button
                        onClick={() => setDefaultCardMutation.mutate(card.id)}
                        disabled={setDefaultCardMutation.isPending}
                        className="text-label-sm text-primary hover:underline"
                      >
                        기본으로 설정
                      </button>
                    )}
                    <button
                      onClick={() => deleteCardMutation.mutate(card.id)}
                      disabled={deleteCardMutation.isPending}
                      className="text-label-sm text-error hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={() => setShowLoginActivity((v) => !v)}
          className="nav-item justify-start"
        >
          <span className="material-symbols-outlined">history</span>
          로그인 활동
        </button>

        {showLoginActivity && (
          <div className="border-t border-outline-variant pt-stack-sm pl-2 flex flex-col gap-stack-sm">
            <div>
              <p className="text-label-sm font-bold text-on-surface-variant mb-1">
                로그인된 기기
              </p>
              {devicesLoading ? (
                <p className="text-label-sm text-on-surface-variant py-1">불러오는 중...</p>
              ) : devices.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant py-1">
                  로그인된 기기가 없어요
                </p>
              ) : (
                <>
                  {devices.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-label-sm text-on-surface-variant truncate max-w-[220px]">
                        {d.userAgent ?? "알 수 없는 기기"} · {d.ipAddress ?? "-"}
                      </span>
                      <button
                        onClick={() => revokeDeviceMutation.mutate(d.id)}
                        disabled={revokeDeviceMutation.isPending}
                        className="text-label-sm text-error hover:underline shrink-0"
                      >
                        로그아웃
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => revokeAllDevicesMutation.mutate()}
                    disabled={revokeAllDevicesMutation.isPending}
                    className="text-label-sm text-error hover:underline mt-1"
                  >
                    모든 기기에서 로그아웃
                  </button>
                </>
              )}
            </div>

            <div>
              <p className="text-label-sm font-bold text-on-surface-variant mb-1">
                최근 로그인 기록
              </p>
              {loginHistoryLoading ? (
                <p className="text-label-sm text-on-surface-variant py-1">불러오는 중...</p>
              ) : loginHistory.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant py-1">기록이 없어요</p>
              ) : (
                loginHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between py-1">
                    <span className="text-label-sm text-on-surface-variant">
                      {h.loginType} · {dayjs(h.createdAt).format("YYYY.MM.DD HH:mm")}
                    </span>
                    <span
                      className={`text-label-sm ${h.success ? "text-primary" : "text-error"}`}
                    >
                      {h.success ? "성공" : "실패"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <button onClick={logout} className="nav-item justify-start text-error">
          <span className="material-symbols-outlined">logout</span>
          로그아웃
        </button>
      </div>
    </div>
  );
}
