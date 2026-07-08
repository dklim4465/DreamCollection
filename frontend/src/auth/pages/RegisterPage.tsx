import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi, type RegisterReq, type VerificationMethod } from "@/auth/api/authApi";
import { useAuthStore } from "@/auth/store/authStore";
import type { TravelStyle } from "@/types";

const TRAVEL_STYLE_OPTIONS: { value: TravelStyle; label: string }[] = [
  { value: "RELAXED", label: "휴식형" },
  { value: "ACTIVE", label: "액티비티형" },
  { value: "CULTURE", label: "문화탐방형" },
  { value: "FOOD", label: "맛집탐방형" },
  { value: "ADVENTURE", label: "모험형" },
];

// 인증번호 유효 시간 (5분)
const CODE_TTL_SECONDS = 5 * 60;

type CodeStatus = "idle" | "sending" | "sent" | "verified" | "expired";

// 이메일/휴대폰 "중복확인" 버튼 상태
// - idle: 아직 확인 안 함 / 확인 후 값이 바뀜(다시 확인 필요)
// - checking: 서버에 확인 요청 중
// - available: 사용 가능
// - duplicate: 이미 가입되어 있음
type DupCheckStatus = "idle" | "checking" | "available" | "duplicate";

// mm:ss 형식으로 변환
const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// 인증번호 발송 후 5분 카운트다운을 관리하는 훅
// - status가 "sent"가 되면 카운트다운 시작
// - 0이 되면 status를 "expired"로 바꾸고 입력창을 숨김
function useVerificationCountdown(
  status: CodeStatus,
  onExpire: () => void
) {
  const [timeLeft, setTimeLeft] = useState(CODE_TTL_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "sent") {
      setTimeLeft(CODE_TTL_SECONDS);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return timeLeft;
}

// passwordConfirm은 화면 검증용이라 API로 보내는 RegisterReq에는 없는 필드
type RegisterFormValues = RegisterReq & { passwordConfirm: string };

export default function RegisterPage() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ defaultValues: { travelStyle: "RELAXED" } });

  // ── 인증 방식 선택 (이메일 / 휴대폰 중 택1) ──────────────────
  const [method, setMethod] = useState<VerificationMethod>("EMAIL");

  // 이메일 인증 상태
  const [emailCodeStatus, setEmailCodeStatus] = useState<CodeStatus>("idle");
  // 휴대폰 인증 상태
  const [phoneCodeStatus, setPhoneCodeStatus] = useState<CodeStatus>("idle");

  // 5분 카운트다운 (발송 시점부터 시작, 0이 되면 자동으로 expired 처리)
  const emailTimeLeft = useVerificationCountdown(emailCodeStatus, () =>
    setEmailCodeStatus("expired")
  );
  const phoneTimeLeft = useVerificationCountdown(phoneCodeStatus, () =>
    setPhoneCodeStatus("expired")
  );

  const email = watch("email");
  const phone = watch("phone");
  const password = watch("password");

  const isVerified = method === "EMAIL" ? emailCodeStatus === "verified" : phoneCodeStatus === "verified";

  // ── 이메일/휴대폰 중복확인 ──────────────────────────────────
  const [emailDupStatus, setEmailDupStatus] = useState<DupCheckStatus>("idle");
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const [phoneDupStatus, setPhoneDupStatus] = useState<DupCheckStatus>("idle");
  const [checkedPhone, setCheckedPhone] = useState<string | null>(null);

  // 확인 완료 후 값이 바뀌면 다시 확인하도록 상태 초기화
  const emailIsChecked = checkedEmail === email && emailDupStatus !== "idle";
  const phoneIsChecked = checkedPhone === phone && phoneDupStatus !== "idle";

  const handleCheckEmail = async () => {
    if (!email) return;
    setEmailDupStatus("checking");
    try {
      const res = await authApi.checkEmail(email);
      setCheckedEmail(email);
      setEmailDupStatus(res.data.data?.available ? "available" : "duplicate");
    } catch {
      setEmailDupStatus("idle");
      setCheckedEmail(null);
    }
  };

  const handleCheckPhone = async () => {
    if (!phone) return;
    setPhoneDupStatus("checking");
    try {
      const res = await authApi.checkPhone(phone);
      setCheckedPhone(phone);
      setPhoneDupStatus(res.data.data?.available ? "available" : "duplicate");
    } catch {
      setPhoneDupStatus("idle");
      setCheckedPhone(null);
    }
  };

  // ── 이메일 인증 핸들러 ──────────────────────────────────────
  const handleSendEmailCode = async () => {
    if (!email) return;
    setEmailCodeStatus("sending");
    try {
      await authApi.sendEmailCode(email);
    } finally {
      setEmailCodeStatus("sent");
    }
  };

  const handleVerifyEmailCode = async (code: string) => {
    if (!code || !email) return;
    await authApi.verifyEmailCode(email, code);
    setEmailCodeStatus("verified");
  };

  // ── 휴대폰 인증 핸들러 ──────────────────────────────────────
  const handleSendPhoneCode = async () => {
    if (!phone) return;
    setPhoneCodeStatus("sending");
    try {
      await authApi.sendPhoneCode(phone);
    } finally {
      setPhoneCodeStatus("sent");
    }
  };

  const handleVerifyPhoneCode = async (code: string) => {
    if (!code || !phone) return;
    await authApi.verifyPhoneCode(phone, code);
    setPhoneCodeStatus("verified");
  };

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      const { accessToken, refreshToken, user } = res.data.data;
      setUser(user, accessToken, refreshToken);
      // 카드 등록은 별도 단계(선택)에서 진행 — 회원가입 폼에서는 카드 정보를 받지 않음
      navigate("/register/card");
    },
  });

  const onSubmit = (d: RegisterFormValues) => {
    const { passwordConfirm: _passwordConfirm, ...payload } = d;
    mutation.mutate({ ...payload, verificationMethod: method });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-base p-8">
          <h1 className="text-headline-md font-bold text-primary mb-2">
            회원가입
          </h1>
          <p className="text-body-md text-on-surface-variant mb-8">
            여정의 시작을 함께해요
          </p>

          {/* 카카오 간편 가입 */}
          <button
            type="button"
            onClick={authApi.redirectToKakaoLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#181600] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity active:scale-95 mb-6"
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            카카오로 가입하기
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-label-sm text-on-surface-variant">
              또는 이메일로 가입
            </span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* 아이디(이메일) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">아이디 (이메일)</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="input-base flex-1"
                  {...register("email", { required: "아이디(이메일)를 입력해주세요" })}
                />
                <button
                  type="button"
                  onClick={handleCheckEmail}
                  disabled={!email || emailDupStatus === "checking"}
                  className="btn-ghost text-sm py-2 px-4 whitespace-nowrap disabled:opacity-50"
                >
                  {emailDupStatus === "checking" ? "확인중..." : "중복확인"}
                </button>
              </div>
              {errors.email && (
                <p className="text-label-sm text-error">{errors.email.message}</p>
              )}
              {emailIsChecked && emailDupStatus === "available" && (
                <p className="text-label-sm text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  사용 가능한 이메일입니다
                </p>
              )}
              {emailIsChecked && emailDupStatus === "duplicate" && (
                <p className="text-label-sm text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">error</span>
                  이미 가입된 이메일입니다
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">비밀번호</label>
              <input
                type="password"
                placeholder="8자 이상"
                className="input-base"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: { value: 8, message: "8자 이상 입력해주세요" },
                })}
              />
              {errors.password && (
                <p className="text-label-sm text-error">{errors.password.message}</p>
              )}
            </div>

            {/* 비밀번호 재확인 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">비밀번호 재확인</label>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                className="input-base"
                {...register("passwordConfirm", {
                  required: "비밀번호를 다시 입력해주세요",
                  validate: (v) => v === password || "비밀번호가 일치하지 않습니다",
                })}
              />
              {errors.passwordConfirm && (
                <p className="text-label-sm text-error">{errors.passwordConfirm.message}</p>
              )}
            </div>

            {/* ── 인증하기 ── */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
              <label className="text-label-md mt-2">인증하기</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("EMAIL")}
                  className={
                    method === "EMAIL"
                      ? "flex-1 rounded-xl border-2 border-primary bg-primary-container py-2.5 text-center font-bold text-label-md"
                      : "flex-1 rounded-xl border-2 border-outline-variant py-2.5 text-center text-on-surface-variant text-label-md"
                  }
                >
                  이메일 인증
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("PHONE")}
                  className={
                    method === "PHONE"
                      ? "flex-1 rounded-xl border-2 border-primary bg-primary-container py-2.5 text-center font-bold text-label-md"
                      : "flex-1 rounded-xl border-2 border-outline-variant py-2.5 text-center text-on-surface-variant text-label-md"
                  }
                >
                  휴대폰 인증
                </button>
              </div>

              {/* 이메일 인증 서브폼 */}
              {method === "EMAIL" && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email || ""}
                      disabled
                      placeholder="위에 입력한 이메일로 발송됩니다"
                      className="input-base flex-1 opacity-70"
                    />
                    <button
                      type="button"
                      onClick={handleSendEmailCode}
                      disabled={!email || emailCodeStatus === "sending" || emailCodeStatus === "verified"}
                      className="btn-ghost text-sm py-2 px-4 whitespace-nowrap disabled:opacity-50"
                    >
                      {emailCodeStatus === "verified"
                        ? "인증완료"
                        : emailCodeStatus === "sending"
                          ? "발송중..."
                          : emailCodeStatus === "sent" || emailCodeStatus === "expired"
                            ? "재발송"
                            : "인증번호 받기"}
                    </button>
                  </div>

                  {(emailCodeStatus === "sent" || emailCodeStatus === "sending") && (
                    <p className="text-label-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">mail</span>
                      인증 이메일이 발송되었습니다. 메일함을 확인해주세요
                    </p>
                  )}

                  {emailCodeStatus === "sent" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="인증번호 6자리"
                          className="input-base flex-1"
                          {...register("emailVerificationCode")}
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyEmailCode(watch("emailVerificationCode") || "")}
                          className="btn-ghost text-sm py-2 px-4 whitespace-nowrap"
                        >
                          확인
                        </button>
                      </div>
                      <p className="text-label-sm text-on-surface-variant text-right">
                        남은 시간{" "}
                        <span className="font-bold text-error">{formatTime(emailTimeLeft)}</span>
                      </p>
                    </div>
                  )}

                  {emailCodeStatus === "expired" && (
                    <p className="text-label-sm text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">error</span>
                      인증번호 유효시간이 만료되었습니다. 다시 발송해주세요
                    </p>
                  )}

                  {emailCodeStatus === "verified" && (
                    <p className="text-label-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      이메일 인증이 완료되었습니다
                    </p>
                  )}
                </div>
              )}

              {/* 휴대폰 인증 서브폼 */}
              {method === "PHONE" && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="010-0000-0000"
                      className="input-base flex-1"
                      disabled={phoneCodeStatus === "verified"}
                      {...register("phone")}
                    />
                    <button
                      type="button"
                      onClick={handleCheckPhone}
                      disabled={!phone || phoneDupStatus === "checking" || phoneCodeStatus === "verified"}
                      className="btn-ghost text-sm py-2 px-4 whitespace-nowrap disabled:opacity-50"
                    >
                      {phoneDupStatus === "checking" ? "확인중..." : "중복확인"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendPhoneCode}
                      disabled={
                        !phone ||
                        !phoneIsChecked ||
                        phoneDupStatus === "duplicate" ||
                        phoneCodeStatus === "sending" ||
                        phoneCodeStatus === "verified"
                      }
                      className="btn-ghost text-sm py-2 px-4 whitespace-nowrap disabled:opacity-50"
                    >
                      {phoneCodeStatus === "verified"
                        ? "인증완료"
                        : phoneCodeStatus === "sending"
                          ? "발송중..."
                          : phoneCodeStatus === "sent" || phoneCodeStatus === "expired"
                            ? "재발송"
                            : "인증번호 받기"}
                    </button>
                  </div>

                  {phoneIsChecked && phoneDupStatus === "available" && (
                    <p className="text-label-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      사용 가능한 휴대폰 번호입니다
                    </p>
                  )}
                  {phoneIsChecked && phoneDupStatus === "duplicate" && (
                    <p className="text-label-sm text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">error</span>
                      이미 가입된 휴대폰 번호입니다
                    </p>
                  )}
                  {!phoneIsChecked && (
                    <p className="text-label-sm text-on-surface-variant">
                      먼저 중복확인을 해주세요
                    </p>
                  )}

                  {(phoneCodeStatus === "sent" || phoneCodeStatus === "sending") && (
                    <p className="text-label-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">sms</span>
                      인증번호가 발송되었습니다. 문자를 확인해주세요
                    </p>
                  )}

                  {phoneCodeStatus === "sent" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="인증번호 6자리"
                          className="input-base flex-1"
                          {...register("phoneVerificationCode")}
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyPhoneCode(watch("phoneVerificationCode") || "")}
                          className="btn-ghost text-sm py-2 px-4 whitespace-nowrap"
                        >
                          확인
                        </button>
                      </div>
                      <p className="text-label-sm text-on-surface-variant text-right">
                        남은 시간{" "}
                        <span className="font-bold text-error">{formatTime(phoneTimeLeft)}</span>
                      </p>
                    </div>
                  )}

                  {phoneCodeStatus === "expired" && (
                    <p className="text-label-sm text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">error</span>
                      인증번호 유효시간이 만료되었습니다. 다시 발송해주세요
                    </p>
                  )}

                  {phoneCodeStatus === "verified" && (
                    <p className="text-label-sm text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      휴대폰 인증이 완료되었습니다
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 이름 */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant">
              <label className="text-label-md mt-2">이름</label>
              <input
                type="text"
                placeholder="홍길동"
                className="input-base"
                {...register("name", { required: "이름을 입력해주세요" })}
              />
              {errors.name && (
                <p className="text-label-sm text-error">{errors.name.message}</p>
              )}
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">닉네임</label>
              <input
                type="text"
                placeholder="여행가"
                className="input-base"
                {...register("nickname", { required: "닉네임을 입력해주세요" })}
              />
              {errors.nickname && (
                <p className="text-label-sm text-error">{errors.nickname.message}</p>
              )}
            </div>

            {/* 여행 스타일 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">내 여행스타일</label>
              <select
                className="input-base"
                {...register("travelStyle", { required: true })}
              >
                {TRAVEL_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 카드 등록은 가입 완료 후 별도 단계(/register/card)에서 진행됩니다.
                카드 원본 정보는 우리 서버가 아니라 토스페이먼츠 서버로 직접 전송되어야 하므로
                (PCI-DSS), 이 폼에서는 카드 정보를 받지 않습니다. */}
            <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-4">
              <span className="material-symbols-outlined text-primary">credit_card</span>
              <p className="text-label-sm text-on-surface-variant">
                결제카드는 가입 완료 후 다음 화면에서 안전하게 등록할 수 있어요
              </p>
            </div>

            {mutation.isError && (
              <p className="text-label-sm text-error">
                회원가입에 실패했습니다. 입력값을 확인해주세요.
              </p>
            )}

            {!isVerified && (
              <p className="text-label-sm text-on-surface-variant text-center">
                {method === "EMAIL" ? "이메일" : "휴대폰"} 인증을 완료해야 가입할 수 있어요
              </p>
            )}
            {isVerified && !emailIsChecked && (
              <p className="text-label-sm text-on-surface-variant text-center">
                이메일 중복확인을 먼저 해주세요
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={
                mutation.isPending ||
                !isVerified ||
                !emailIsChecked ||
                emailDupStatus === "duplicate"
              }
            >
              {mutation.isPending ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <p className="text-body-md text-center mt-6 text-on-surface-variant">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
