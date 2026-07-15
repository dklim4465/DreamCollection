import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAuthStore } from "@/auth/store/authStore";
import { paymentApi } from "@/payment/api/paymentApi";
import { paymentCardApi, TOSS_CLIENT_KEY } from "@/payment/api/paymentCardApi";
import { requestCardBillingAuth } from "@/payment/api/tossPayments";
import { levelApi } from "@/profile/api/levelApi";
import { profileApi } from "@/profile/api/profileApi";
import { deviceApi } from "@/profile/api/deviceApi";
import { badgeApi } from "@/profile/api/badgeApi";
import { couponApi } from "@/profile/api/couponApi";
import { matchesKoreanSearch } from "@/common/utils/hangul";
import type { TravelStyle } from "@/types";

const TRAVEL_STYLE_LABEL: Record<TravelStyle, string> = {
  RELAXED: "휴식형",
  ACTIVE: "액티비티형",
  CULTURE: "문화탐방형",
  FOOD: "맛집탐방형",
  ADVENTURE: "모험형",
};

const TRAVEL_STYLE_OPTIONS = Object.keys(TRAVEL_STYLE_LABEL) as TravelStyle[];

function getErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

/**
 * 마이페이지
 * - 프로필 정보 (+ 인라인 수정: 닉네임/사진/여행스타일/비밀번호)
 * - 프로필 사진 클릭 → 라이트박스(원본 크게보기, X로 닫기)
 * - 뱃지 도감
 * - 레벨 시스템 (여행 횟수 기준)
 * - 결제내역 / 결제수단 관리 (조회·삭제·기본변경·신규등록)
 * - 로그인 활동(기록/기기)
 */
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(user?.travelStyle ?? "RELAXED");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showCardManager, setShowCardManager] = useState(false);
  const [showLoginActivity, setShowLoginActivity] = useState(false);
  const [badgeQuery, setBadgeQuery] = useState("");
  const badgeScrollRef = useRef<HTMLDivElement>(null);

  type ProfileTab = "profile" | "badges" | "coupons" | "payments" | "account";
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as ProfileTab) || "profile";
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    ["profile", "badges", "coupons", "payments", "account"].includes(initialTab)
      ? initialTab
      : "profile",
  );

  const [isRequestingCard, setIsRequestingCard] = useState(false);
  const [cardRegisterError, setCardRegisterError] = useState<string | null>(null);

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

  // 뱃지 도감 — 항상 조회 (닉네임 옆 대표뱃지 표시에도 필요)
  const { data: badgesRes, isLoading: badgesLoading } = useQuery({
    queryKey: ["badges", "me"],
    queryFn: badgeApi.getMyBadges,
    enabled: !!user,
  });

  // 보관함(쿠폰) — 보관함 탭을 열었을 때 조회
  const { data: couponsRes, isLoading: couponsLoading } = useQuery({
    queryKey: ["coupons", "me"],
    queryFn: couponApi.getMyCoupons,
    enabled: !!user && activeTab === "coupons",
  });

  const setRepresentativeMutation = useMutation({
    mutationFn: (badgeId: number) => badgeApi.setRepresentative(badgeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["badges", "me"] }),
  });

  const clearRepresentativeMutation = useMutation({
    mutationFn: () => badgeApi.clearRepresentative(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["badges", "me"] }),
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
        travelStyle: travelStyle !== user?.travelStyle ? travelStyle : undefined,
      }),
    onSuccess: (res) => {
      const updated = res.data?.data;
      if (updated) updateUser(updated);
      setEditError(null);
    },
    onError: (err: unknown) => setEditError(getErrorMessage(err, "프로필 수정에 실패했어요. 잠시 후 다시 시도해주세요.")),
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadProfileImage(file),
    onSuccess: (res) => {
      const updated = res.data?.data;
      if (updated) updateUser(updated);
      setPreviewUrl(null);
    },
    onError: (err: unknown) => setEditError(getErrorMessage(err, "사진 업로드에 실패했어요.")),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => profileApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    },
    onError: (err: unknown) => setPasswordError(getErrorMessage(err, "비밀번호 변경에 실패했어요.")),
  });

  // 프로필 수정 패널이 열려있는 동안, 닉네임/여행스타일이 바뀌면 800ms 후 자동 저장
  useEffect(() => {
    if (!user || !isEditing) return;
    if (!nickname.trim()) return;
    if (nickname === user.nickname && travelStyle === user.travelStyle) return;

    const timer = setTimeout(() => {
      updateProfileMutation.mutate();
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname, travelStyle, isEditing, user]);

  if (!user) return null;

  const payments = paymentsRes?.data?.data ?? [];
  const levelInfo = levelRes?.data?.data;
  const badges = badgesRes?.data?.data ?? [];
  const filteredBadges = badges.filter((b) => matchesKoreanSearch(badgeQuery, b.name));
  const coupons = couponsRes?.data?.data ?? [];
  const representativeBadge = badges.find((b) => b.representative);
  const cards = cardsRes?.data?.data ?? [];
  const loginHistory = loginHistoryRes?.data?.data ?? [];
  const devices = devicesRes?.data?.data ?? [];
  const displayedImage = previewUrl ?? user.profileImage;

  const startEditing = () => {
    setNickname(user.nickname);
    setTravelStyle(user.travelStyle);
    setPreviewUrl(null);
    setEditError(null);
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    uploadImageMutation.mutate(file);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    if (newPassword !== newPasswordConfirm) {
      setPasswordError("새 비밀번호가 서로 일치하지 않아요.");
      return;
    }
    changePasswordMutation.mutate();
  };

  const handleRegisterCard = async () => {
    if (!user) return;
    setIsRequestingCard(true);
    setCardRegisterError(null);
    try {
      // 성공 시 토스가 /billing/success로 리다이렉트하므로 이후 코드는 보통 실행되지 않음
      await requestCardBillingAuth(TOSS_CLIENT_KEY, `user-${user.id}`);
    } catch (e) {
      setCardRegisterError(e instanceof Error ? e.message : "카드 등록 창을 여는 데 실패했어요.");
      setIsRequestingCard(false);
    }
  };

  const TABS: { key: ProfileTab; label: string; icon: string }[] = [
    { key: "profile", label: "프로필", icon: "person" },
    { key: "badges", label: "뱃지 도감", icon: "military_tech" },
    { key: "coupons", label: "보관함", icon: "confirmation_number" },
    { key: "payments", label: "결제내역", icon: "receipt_long" },
    { key: "account", label: "계정 관리", icon: "manage_accounts" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-headline-md font-bold mb-stack-lg">마이페이지</h1>

      <div className="flex flex-col md:flex-row gap-stack-lg items-start">
        {/* 좌측 탭 네비게이션 */}
        <div className="card-base p-stack-sm w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key ? "nav-item-active" : "nav-item"
              } whitespace-nowrap shrink-0`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 우측 컨텐츠 */}
        <div className="flex-1 w-full flex flex-col gap-stack-lg">
          {activeTab === "profile" && (
      <div className="card-base p-stack-lg flex flex-col gap-stack-md">
        <div className="flex items-center gap-stack-md">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => displayedImage && setShowLightbox(true)}
              className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center overflow-hidden"
            >
              {displayedImage ? (
                <img src={displayedImage} alt={user.nickname} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-4xl">person</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => (isEditing ? setIsEditing(false) : startEditing())}
              aria-label="프로필 수정"
              title="프로필 수정"
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base leading-none">edit</span>
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-headline-sm font-bold">{user.nickname}</p>
              {representativeBadge && (
                <img
                  src={representativeBadge.iconUrl}
                  alt={representativeBadge.name}
                  title={representativeBadge.name}
                  className="w-6 h-6"
                />
              )}
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
                      <span>다음 레벨까지 {levelInfo.tripsToNextLevel}회 남음</span>
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
                프로필 사진
              </label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shrink-0">
                  {displayedImage ? (
                    <img src={displayedImage} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-2xl">person</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {uploadImageMutation.isPending && (
                  <span className="text-label-sm text-on-surface-variant">업로드 중...</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">
                닉네임 <span className="font-normal">(2주에 한 번만 변경 가능)</span>
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

            {editError && <p className="text-label-sm text-error">{editError}</p>}

            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => setIsEditing(false)} className="btn-ghost text-sm py-2 px-5">
                닫기
              </button>
              <span className="text-label-sm text-on-surface-variant">
                {updateProfileMutation.isPending
                  ? "저장 중..."
                  : updateProfileMutation.isSuccess
                    ? "자동 저장됨"
                    : "변경하면 자동으로 저장돼요"}
              </span>
            </div>
          </div>
        )}
      </div>
          )}

          {activeTab === "badges" && (
      <div className="card-base p-stack-lg">
        <div className="flex items-center justify-between mb-stack-sm gap-stack-md flex-wrap">
          <h2 className="text-headline-sm font-bold">뱃지 도감</h2>
          {representativeBadge && (
            <button
              onClick={() => clearRepresentativeMutation.mutate()}
              disabled={clearRepresentativeMutation.isPending}
              className="text-label-sm text-on-surface-variant hover:underline"
            >
              대표뱃지 해제
            </button>
          )}
        </div>

        {/* 검색: 국가 이름 초성만 쳐도 매칭됨 (예: "ㅇㅂ" → 일본) */}
        <div className="relative mb-stack-md max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={badgeQuery}
            onChange={(e) => setBadgeQuery(e.target.value)}
            placeholder="뱃지 이름 검색 (초성 가능, 예: ㅇㅂ)"
            className="input-search w-full"
          />
        </div>

        {badgesLoading ? (
          <p className="text-body-sm text-on-surface-variant py-4">불러오는 중...</p>
        ) : filteredBadges.length === 0 ? (
          <p className="text-body-md text-on-surface-variant py-4">검색 결과가 없어요.</p>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                badgeScrollRef.current?.scrollBy({
                  left: -badgeScrollRef.current.clientWidth,
                  behavior: "smooth",
                })
              }
              aria-label="이전 뱃지"
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-surface-container-lowest shadow-glow hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div
              ref={badgeScrollRef}
              className="grid grid-flow-col grid-rows-2 auto-cols-[19%] sm:auto-cols-[19%] gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 hide-scrollbar"
            >
              {filteredBadges.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  disabled={!b.earned || setRepresentativeMutation.isPending}
                  onClick={() => setRepresentativeMutation.mutate(b.id)}
                  title={b.earned ? b.description : `획득 조건: ${b.description}`}
                  className={`snap-start flex flex-col items-center gap-1 p-2 rounded-xl transition-opacity ${
                    b.earned ? "opacity-100 hover:bg-surface-container-low" : "opacity-30 grayscale cursor-default"
                  } ${b.representative ? "ring-2 ring-primary" : ""}`}
                >
                  <img src={b.iconUrl} alt={b.name} className="w-12 h-12" />
                  <span className="text-label-sm text-center line-clamp-1">{b.name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                badgeScrollRef.current?.scrollBy({
                  left: badgeScrollRef.current.clientWidth,
                  behavior: "smooth",
                })
              }
              aria-label="다음 뱃지"
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-surface-container-lowest shadow-glow hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </div>
          )}

          {activeTab === "coupons" && (
      <div className="card-base p-stack-lg">
        <h2 className="text-headline-sm font-bold mb-stack-sm">보관함</h2>
        {couponsLoading ? (
          <p className="text-body-sm text-on-surface-variant py-4">불러오는 중...</p>
        ) : coupons.length === 0 ? (
          <p className="text-body-md text-on-surface-variant py-4">
            아직 보관 중인 쿠폰이 없어요. 홈 화면의 7월 이벤트 배너를 확인해보세요!
          </p>
        ) : (
          <div className="flex flex-col gap-stack-sm">
            {coupons.map((c) => {
              const expired = c.status === "EXPIRED" || dayjs(c.expiresAt).isBefore(dayjs());
              const used = c.status === "USED";
              return (
                <div
                  key={c.id}
                  className={`flex items-center justify-between rounded-2xl border p-stack-md ${
                    used || expired
                      ? "border-outline-variant opacity-50"
                      : "border-primary-container bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-stack-md">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                    </div>
                    <div>
                      <p className="text-headline-sm font-bold">
                        {c.discountValue}% 할인 · {c.name}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">{c.description}</p>
                      <p className="text-label-sm text-on-surface-variant mt-0.5">
                        {dayjs(c.expiresAt).format("YYYY.MM.DD")}까지 사용 가능
                      </p>
                    </div>
                  </div>
                  <span className="text-label-md font-bold px-3 py-1 rounded-full bg-surface-container-high">
                    {used ? "사용완료" : expired ? "기간만료" : "사용가능"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
          )}

          {activeTab === "payments" && (
      <div className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold mb-1">결제내역</h2>
        {payments.length === 0 ? (
          <p className="text-body-md text-on-surface-variant py-4">아직 결제 내역이 없어요</p>
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
              <span className="text-body-md font-bold">{p.amount.toLocaleString("ko-KR")}원</span>
            </div>
          ))
        )}
      </div>
          )}

          {activeTab === "account" && (
      <div className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold mb-2">계정 관리</h2>
        <button
          onClick={() => setShowPasswordForm((v) => !v)}
          className="nav-item justify-start"
        >
          <span className="material-symbols-outlined">lock</span>
          비밀번호 변경
        </button>

        {showPasswordForm && (
          <form
            onSubmit={handlePasswordSubmit}
            className="border-t border-outline-variant pt-stack-sm pl-2 flex flex-col gap-2 max-w-sm"
          >
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-base"
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 (8자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base"
              minLength={8}
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              className="input-base"
              required
            />
            {passwordError && <p className="text-label-sm text-error">{passwordError}</p>}
            {passwordSuccess && (
              <p className="text-label-sm text-primary">
                변경됐어요. 다른 기기는 전부 로그아웃 처리됐어요.
              </p>
            )}
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-primary text-sm py-2 px-5 self-start disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}

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
              <p className="text-label-sm text-on-surface-variant py-2">등록된 결제수단이 없어요</p>
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

            {cardRegisterError && <p className="text-label-sm text-error">{cardRegisterError}</p>}

            <button
              onClick={handleRegisterCard}
              disabled={isRequestingCard}
              className="btn-ghost text-sm py-2 px-4 self-start flex items-center gap-1.5 mt-1"
            >
              <span className="material-symbols-outlined text-lg">add_card</span>
              {isRequestingCard ? "이동 중..." : "새 카드 등록하기"}
            </button>
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
              <p className="text-label-sm font-bold text-on-surface-variant mb-1">로그인된 기기</p>
              {devicesLoading ? (
                <p className="text-label-sm text-on-surface-variant py-1">불러오는 중...</p>
              ) : devices.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant py-1">로그인된 기기가 없어요</p>
              ) : (
                <>
                  {devices.map((d) => (
                    <div key={d.id} className="flex items-center justify-between py-1.5">
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
              <p className="text-label-sm font-bold text-on-surface-variant mb-1">최근 로그인 기록</p>
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
                    <span className={`text-label-sm ${h.success ? "text-primary" : "text-error"}`}>
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
          )}
        </div>
      </div>

      {/* 프로필 사진 라이트박스 — 배경 클릭 또는 우측 상단 X로 닫힘 */}
      {showLightbox && displayedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            aria-label="닫기"
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <img
            src={displayedImage}
            alt={user.nickname}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}