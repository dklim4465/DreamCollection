import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi, type LoginReq } from "@/auth/api/authApi";
import { useAuthStore } from "@/auth/store/authStore";
import AuthLayout from "@/auth/components/AuthLayout";

export default function LoginPage() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginReq>();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const { accessToken, refreshToken, user } = res.data.data;
      setUser(user, accessToken, refreshToken);
      navigate("/");
    },
  });

  return (
    <AuthLayout
      eyebrow="TRAVELER'S HUB"
      title="다시 만나 반가워요"
      description="저장해둔 여행 계획과 지금까지 모은 기록을 이어가 볼까요."
    >
      <div className="card-base p-8">
        <button
          type="button"
          onClick={authApi.redirectToKakaoLogin}
          className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#181600] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity active:scale-95 mb-6"
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          카카오로 로그인
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-outline-variant" />
          <span className="text-label-sm text-on-surface-variant">
            또는 이메일로 로그인
          </span>
          <div className="flex-1 h-px bg-outline-variant" />
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
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
                {...register("email", { required: "이메일을 입력해주세요" })}
              />
            </div>
            {errors.email && (
              <p className="text-label-sm text-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md">비밀번호</label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">
                lock
              </span>
              <input
                type="password"
                placeholder="8자 이상"
                className="input-base pl-10"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                })}
              />
            </div>
            {errors.password && (
              <p className="text-label-sm text-error">
                {errors.password.message}
              </p>
            )}
            <Link
              to="/forgot-password"
              className="text-label-sm text-on-surface-variant hover:text-primary self-end mt-1"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {mutation.isError && (
            <p className="text-label-sm text-error">
              이메일 또는 비밀번호를 확인해주세요.
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-body-md text-center mt-6 text-on-surface-variant">
          계정이 없으신가요?{" "}
          <Link
            to="/register"
            className="text-primary font-bold hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
