import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi, type RegisterReq } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import type { TravelStyle } from "@/types";

const TRAVEL_STYLE_OPTIONS: { value: TravelStyle; label: string }[] = [
  { value: "RELAXED", label: "휴식형" },
  { value: "ACTIVE", label: "액티비티형" },
  { value: "CULTURE", label: "문화탐방형" },
  { value: "FOOD", label: "맛집탐방형" },
  { value: "ADVENTURE", label: "모험형" },
];

export default function RegisterPage() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterReq>({ defaultValues: { travelStyle: "RELAXED" } });

  // 전화번호 인증 상태 (TODO: 실제 SMS 인증 API 연동)
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingCode, setSending] = useState(false);

  const phone = watch("phone");

  const handleSendCode = async () => {
    if (!phone) return;
    setSending(true);
    try {
      await authApi.sendPhoneCode(phone);
    } catch {
      // TODO: 실제 백엔드 연동 전까지는 네트워크 오류를 무시하고 진행
    } finally {
      setSending(false);
      setCodeSent(true);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (!code) return;
    try {
      await authApi.verifyPhoneCode(phone, code);
    } catch {
      // TODO: 실제 백엔드 연동 전까지는 항상 통과 처리
    } finally {
      setVerified(true);
    }
  };

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      const { accessToken, user } = res.data.data;
      setUser(user, accessToken);
      navigate("/");
    },
  });

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
            onClick={authApi.kakaoLogin}
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

          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="flex flex-col gap-4"
          >
            {/* 이름 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">이름</label>
              <input
                type="text"
                placeholder="홍길동"
                className="input-base"
                {...register("name", { required: "이름을 입력해주세요" })}
              />
              {errors.name && (
                <p className="text-label-sm text-error">
                  {errors.name.message}
                </p>
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
                <p className="text-label-sm text-error">
                  {errors.nickname.message}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">이메일</label>
              <input
                type="email"
                placeholder="example@email.com"
                className="input-base"
                {...register("email", { required: "이메일을 입력해주세요" })}
              />
              {errors.email && (
                <p className="text-label-sm text-error">
                  {errors.email.message}
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
                <p className="text-label-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 전화번호 + 인증 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">전화번호</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  className="input-base flex-1"
                  disabled={verified}
                  {...register("phone", {
                    required: "전화번호를 입력해주세요",
                  })}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!phone || sendingCode || verified}
                  className="btn-ghost text-sm py-2 px-4 whitespace-nowrap disabled:opacity-50"
                >
                  {verified
                    ? "인증완료"
                    : sendingCode
                      ? "발송중..."
                      : "인증번호 받기"}
                </button>
              </div>
              {errors.phone && (
                <p className="text-label-sm text-error">
                  {errors.phone.message}
                </p>
              )}

              {codeSent && !verified && (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="인증번호 6자리"
                    className="input-base flex-1"
                    {...register("phoneVerificationCode")}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleVerifyCode(watch("phoneVerificationCode") || "")
                    }
                    className="btn-ghost text-sm py-2 px-4 whitespace-nowrap"
                  >
                    확인
                  </button>
                </div>
              )}
              {verified && (
                <p className="text-label-sm text-primary flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-base">
                    check_circle
                  </span>
                  휴대폰 인증이 완료되었습니다
                </p>
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

            {/* 카드 등록 (선택, 결제수단 사전 등록용 더미 UI) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">
                카드 등록{" "}
                <span className="text-on-surface-variant text-label-sm">
                  (선택)
                </span>
              </label>
              <input
                type="text"
                placeholder="카드 번호"
                className="input-base"
                {...register("cardNumber")}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="input-base flex-1"
                  {...register("cardExpiry")}
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="input-base flex-1"
                  {...register("cardCvc")}
                />
              </div>
              {/* TODO: 실제 결제 PG사(토스페이먼츠, 아임포트 등) 연동 필요. 현재는 UI만 구현된 더미 항목입니다. */}
              <p className="text-label-sm text-on-surface-variant">
                실제 결제 연동 전 단계로, 카드 정보는 저장/검증되지 않습니다.
              </p>
            </div>

            {mutation.isError && (
              <p className="text-label-sm text-error">
                회원가입에 실패했습니다. 입력값을 확인해주세요.
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <p className="text-body-md text-center mt-6 text-on-surface-variant">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
