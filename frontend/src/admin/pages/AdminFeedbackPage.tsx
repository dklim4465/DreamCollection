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

  const openItem = (item: FeedbackAdminItem) => {
    setSelected(item);
    if (!item.checked) checkMutation.mutate(item.id);
  };

  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md font-bold">문의 내역</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          홈페이지 하단 "문의하기"에서 접수된 버그신고/건의사항이에요. 관리자 이메일로도 전달돼요.
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
            className="card-base p-stack-lg max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-stack-sm">
              <span className="chip-tertiary">{CATEGORY_LABEL[selected.category] ?? selected.category}</span>
              <button type="button" onClick={() => setSelected(null)} aria-label="닫기">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-body-md font-bold">{selected.name}</p>
            <p className="text-label-sm text-on-surface-variant mb-stack-sm">{selected.email}</p>
            <p className="text-body-sm whitespace-pre-wrap">{selected.message}</p>
            <p className="text-label-sm text-on-surface-variant mt-stack-sm">
              {new Date(selected.createdAt).toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
