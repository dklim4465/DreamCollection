import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type FeedbackAdminItem } from "@/admin/api/adminApi";

const CATEGORY_LABEL: Record<string, string> = {
  BUG: "버그 신고",
  SUGGESTION: "건의사항",
  ETC: "기타 문의",
};

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<FeedbackAdminItem | null>(null);
  const [answerText, setAnswerText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "feedback", page],
    queryFn: () => adminApi.getFeedback(page, 20),
  });

  const result = data?.data?.data;
  const items = result?.content ?? [];

  const checkMutation = useMutation({
    mutationFn: (id: number) => adminApi.markFeedbackChecked(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] }),
  });

  const answerMutation = useMutation({
    mutationFn: ({ id, answer }: { id: number; answer: string }) =>
      adminApi.answerFeedback(id, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
      setSelected(null);
      setAnswerText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
      setSelected(null);
    },
  });

  const openItem = (item: FeedbackAdminItem) => {
    setSelected(item);
    setAnswerText(item.answer ?? "");
    if (!item.checked) checkMutation.mutate(item.id);
  };

  const handleSendAnswer = () => {
    if (!selected || !answerText.trim()) return;
    answerMutation.mutate({ id: selected.id, answer: answerText.trim() });
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm("이 문의를 삭제할까요? 되돌릴 수 없어요.")) return;
    deleteMutation.mutate(selected.id);
  };

  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md font-bold">문의 내역</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          홈페이지 하단 "문의하기"에서 접수된 버그신고/건의사항이에요. 답변을 보내면 관리자
          이메일 대신 문의자 이메일로 전달되고, 로그인 상태로 보낸 문의라면 그 회원의
          마이페이지 "편지함"에도 편지가 도착해요.
        </p>
      </div>

      <div className="card-base p-stack-lg">
        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">접수된 문의가 없어요.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors text-left"
                  >
                    {!item.checked && <span className="w-2 h-2 rounded-full bg-error shrink-0" />}
                    <span className="chip-tertiary shrink-0">{CATEGORY_LABEL[item.category] ?? item.category}</span>
                    <span className="min-w-0 flex-1">
                      <p className="text-body-sm font-semibold truncate">
                        {item.name} ({item.email})
                      </p>
                      <p className="text-label-sm text-on-surface-variant truncate">{item.message}</p>
                    </span>
                    {item.answer && (
                      <span className="chip-primary shrink-0 text-label-sm">답변완료</span>
                    )}
                    <span className="text-label-sm text-on-surface-variant shrink-0">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {result && result.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-stack-md">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  이전
                </button>
                <span className="text-label-sm text-on-surface-variant">
                  {page + 1} / {result.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page + 1 >= result.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="card-base p-stack-lg max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-stack-sm">
              <span className="chip-tertiary">{CATEGORY_LABEL[selected.category] ?? selected.category}</span>
              <button type="button" onClick={() => setSelected(null)} aria-label="닫기">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-body-md font-bold">{selected.name}</p>
            <p className="text-label-sm text-on-surface-variant mb-stack-sm">
              {selected.email}
              {selected.userId && (
                <span className="ml-2 chip-primary text-label-sm py-0.5 px-2">
                  회원 (편지함으로 전달됨)
                </span>
              )}
            </p>
            <p className="text-body-sm whitespace-pre-wrap">{selected.message}</p>
            <p className="text-label-sm text-on-surface-variant mt-stack-sm">
              {new Date(selected.createdAt).toLocaleString("ko-KR")}
            </p>

            <div className="mt-stack-md pt-stack-md border-t border-outline-variant">
              <label className="text-body-sm font-bold" htmlFor="feedback-answer">
                {selected.answer ? "답변 내용 (수정 후 다시 보내기)" : "답변 작성"}
              </label>
              {selected.answeredAt && (
                <p className="text-label-sm text-on-surface-variant mt-1">
                  {new Date(selected.answeredAt).toLocaleString("ko-KR")}에 답변함
                </p>
              )}
              <textarea
                id="feedback-answer"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={5}
                placeholder="문의자에게 보낼 답변을 입력하세요"
                className="mt-2 w-full rounded-lg border border-outline-variant p-3 text-body-sm resize-none"
              />
              <div className="flex items-center justify-between mt-stack-sm">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="btn-ghost text-sm py-2 px-4 text-error disabled:opacity-40"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={handleSendAnswer}
                  disabled={!answerText.trim() || answerMutation.isPending}
                  className="btn-primary text-sm py-2 px-5 disabled:opacity-40"
                >
                  {answerMutation.isPending ? "보내는 중..." : "답변 보내기"}
                </button>
              </div>
              {answerMutation.isError && (
                <p className="text-label-sm text-error mt-2">답변 전송에 실패했어요. 다시 시도해주세요.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
