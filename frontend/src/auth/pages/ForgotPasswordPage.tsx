import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/auth/api/authApi";
import AuthLayout from "@/auth/components/AuthLayout";

type Step = "EMAIL" | "CODE" | "NEW_PASSWORD" | "DONE";

function getErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

const STEP_COPY: Record<Step, { eyebrow: string; title: string; description: (email: string) => string }> = {
  EMAIL: {
    eyebrow: "PASSWORD RESET",
    title: "괜찮아요, 다시 찾아드릴게요",
    description: () => "가입하신 이메일로 인증번호를 보내드릴게요.",
  },
  CODE: {
    eyebrow: "PASSWORD RESET",
    title: "메일함을 확인해주세요",
    description: (email) => `${email}로 보낸 인증번호 6자리를 입력하면 다음 단계로 넘어가요.`,
  },
  NEW_PASSWORD: {
    eyebrow: "PASSWORD RESET",
    title: "새 비밀번호를 정해주세요",
    description: () => "다음 여행을 위해 안전한 비밀번호로 바꿔보세요.",
  },
  DONE: {
    eyebrow: "PASSWORD RESET",
    title: "변경이 완료됐어요",
    description: () => "새 비밀번호로 다시 로그인하고 여행을 이어가세요.",
  },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const emailForm = useForm<{ email: string }>();
  const codeForm = useForm<{ code: string }>();
  const passwordForm = useForm<{ newPassword: string; confirmPassword: string }>();

  // 1단계: 이메일로 인증코드 발송
  const requestMutation = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: (_res, email) => {
      setEmail(email);
      setStep("CODE");
    },
  });

  // 2단계: 인증코드 검증 → resetToken 발급
  const verifyMutation = useMutation({
    mutationFn: (code: string) => authApi.verifyPasswordResetCode(email, code),
    onSuccess: (res) => {
      setResetToken(res.data.data.resetToken);
      setStep("NEW_PASSWORD");
    },
  });

  // 3단계: 새 비밀번호로 최종 변경
  const confirmMutation = useMutation({
    mutationFn: (newPassword: string) => authApi.confirmPasswordReset(resetToken, newPassword),
    onSuccess: () => setStep("DONE"),
  });

  const copy = STEP_COPY[step];

  return (
    <AuthLayout eyebrow={copy.eyebrow} title={copy.title} description={copy.description(email)}>
      <div className="card-base p-8">
        {step === "EMAIL" && (
          <form
            onSubmit={emailForm.handleSubmit((d) => requestMutation.mutate(d.email))}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">이메일</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="input-base pl-10"
                  {...emailForm.register("email", { required: "이메일을 입력해주세요" })}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-label-sm text-error">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {requestMutation.isError && (
              <p className="text-label-sm text-error">
                {getErrorMessage(requestMutation.error, "가입되지 않은 이메일이에요.")}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={requestMutation.isPending}
            >
              {requestMutation.isPending ? "발송 중..." : "인증번호 받기"}
            </button>
          </form>
        )}

        {step === "CODE" && (
          <form
            onSubmit={codeForm.handleSubmit((d) => verifyMutation.mutate(d.code))}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">인증번호</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
                  pin
                </span>
                <input
                  type="text"
                  placeholder="6자리 숫자"
                  className="input-base pl-10"
                  {...codeForm.register("code", { required: "인증번호를 입력해주세요" })}
                />
              </div>
              {codeForm.formState.errors.code && (
                <p className="text-label-sm text-error">
                  {codeForm.formState.errors.code.message}
                </p>
              )}
            </div>

            {verifyMutation.isError && (
              <p className="text-label-sm text-error">
                {getErrorMessage(verifyMutation.error, "인증번호가 올바르지 않아요.")}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "확인 중..." : "인증번호 확인"}
            </button>

            <button
              type="button"
              onClick={() => requestMutation.mutate(email)}
              className="btn-ghost text-sm py-2"
              disabled={requestMutation.isPending}
            >
              인증번호 다시 받기
            </button>
          </form>
        )}

        {step === "NEW_PASSWORD" && (
          <form
            onSubmit={passwordForm.handleSubmit((d) => {
              if (d.newPassword !== d.confirmPassword) {
                passwordForm.setError("confirmPassword", {
                  message: "비밀번호가 일치하지 않아요",
                });
                return;
              }
              confirmMutation.mutate(d.newPassword);
            })}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">새 비밀번호</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
                  lock
                </span>
                <input
                  type="password"
                  placeholder="8자 이상"
                  className="input-base pl-10"
                  {...passwordForm.register("newPassword", {
                    required: "새 비밀번호를 입력해주세요",
                    minLength: { value: 8, message: "비밀번호는 8자 이상이어야 해요" },
                  })}
                />
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-label-sm text-error">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">새 비밀번호 확인</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
                  lock_reset
                </span>
                <input
                  type="password"
                  placeholder="다시 한 번 입력해주세요"
                  className="input-base pl-10"
                  {...passwordForm.register("confirmPassword", {
                    required: "비밀번호를 다시 입력해주세요",
                  })}
                />
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-label-sm text-error">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {confirmMutation.isError && (
              <p className="text-label-sm text-error">
                {getErrorMessage(
                  confirmMutation.error,
                  "재설정 링크가 만료되었어요. 처음부터 다시 시도해주세요."
                )}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? "변경 중..." : "비밀번호 변경하기"}
            </button>
          </form>
        )}

        {step === "DONE" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="material-symbols-outlined text-5xl text-primary">
              check_circle
            </span>
            <p className="text-body-md">
              새 비밀번호로 다시 로그인해주세요. 다른 기기에 로그인되어 있었다면 전부
              로그아웃 처리됐어요.
            </p>
            <button onClick={() => navigate("/login")} className="btn-primary w-full">
              로그인하러 가기
            </button>
          </div>
        )}

        {step !== "DONE" && (
          <p className="text-body-md text-center mt-6 text-on-surface-variant">
            <Link to="/login" className="text-primary font-bold hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
