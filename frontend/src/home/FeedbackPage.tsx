import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { feedbackApi, type FeedbackCategory } from "@/common/api/feedbackApi";
import { useAuthStore } from "@/auth/store/authStore";

const CATEGORIES: { value: FeedbackCategory; label: string; icon: string }[] = [
  { value: "BUG", label: "버그 신고", icon: "bug_report" },
  { value: "SUGGESTION", label: "건의사항", icon: "lightbulb" },
  { value: "ETC", label: "기타 문의", icon: "chat_bubble" },
];

/**
 * 하단 푸터의 메일 아이콘에서 진입하는 문의하기 페이지.
 * 여기서 보낸 내용은 관리자 이메일로 곧장 전달된다(백엔드: FeedbackController → EmailSender).
 * 로그인 여부와 무관하게 누구나 이용 가능 — 비로그인 방문자도 문제를 신고할 수 있어야 하므로.
 */
export default function FeedbackPage() {
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState(user?.name ?? user?.nickname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [category, setCategory] = useState<FeedbackCategory>("SUGGESTION");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => feedbackApi.submit({ name, email, category, message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    mutation.mutate();
  };

  if (mutation.isSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <span className="material-symbols-outlined text-5xl text-primary mb-stack-sm">
          mark_email_read
        </span>
        <h1 className="text-headline-md font-bold mb-2">문의가 접수됐어요</h1>
        <p className="text-body-md text-on-surface-variant mb-stack-lg">
          입력하신 이메일로 답변드릴게요. 빠르게 확인할게요, 감사해요!
        </p>
        <Link to="/" className="btn-primary">
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-headline-md font-bold mb-2">문의하기</h1>
      <p className="text-body-md text-on-surface-variant mb-stack-lg">
        홈페이지에서 이상한 점을 발견하셨거나, 이런 기능이 있으면 좋겠다는 아이디어가 있으면
        편하게 남겨주세요. 남겨주신 이메일로 답변드려요.
      </p>

      <form onSubmit={handleSubmit} className="card-base p-8 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={
                category === c.value
                  ? "flex flex-col items-center gap-1.5 rounded-xl border-2 border-primary bg-primary-container p-3 text-on-primary-container"
                  : "flex flex-col items-center gap-1.5 rounded-xl border-2 border-outline-variant p-3 text-on-surface-variant hover:border-primary/40 transition-colors"
              }
            >
              <span className="material-symbols-outlined text-xl">{c.icon}</span>
              <span className="text-label-sm font-bold">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label-md">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="input-base"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label-md">답장받을 이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="input-base"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label-md">내용</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="어떤 페이지에서, 어떤 문제가 있었는지 최대한 자세히 적어주시면 도움이 돼요."
            className="input-base min-h-40 resize-none"
            maxLength={2000}
            required
          />
          <p className="text-label-sm text-on-surface-variant text-right">
            {message.length} / 2000
          </p>
        </div>

        {mutation.isError && (
          <p className="text-label-sm text-error">
            전송에 실패했어요. 잠시 후 다시 시도해주세요.
          </p>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "보내는 중..." : "문의 보내기"}
        </button>
      </form>
    </div>
  );
}
