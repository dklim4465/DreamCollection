import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/admin/api/adminApi";

const CATEGORY_LABEL: Record<string, string> = {
  FREE: "자유",
  TRANSFER: "예약양도",
  REVIEW: "후기",
};

export default function AdminBoardPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "board", "posts", page],
    queryFn: () => adminApi.getBoardPosts(page, 20),
  });

  const result = data?.data?.data;
  const posts = result?.content ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBoardPost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "board", "posts"] }),
  });

  return (
    <div className="flex flex-col gap-stack-lg">
      <div>
        <h1 className="text-headline-md font-bold">게시판 관리</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          자유/예약양도/후기 게시글을 확인하고, 문제가 있는 글을 삭제할 수 있어요.
        </p>
      </div>

      <div className="card-base p-stack-lg">
        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">등록된 게시글이 없어요.</p>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                  <th className="py-2 pr-2">분류</th>
                  <th className="py-2 pr-2">제목</th>
                  <th className="py-2 pr-2">작성자</th>
                  <th className="py-2 pr-2">조회/좋아요</th>
                  <th className="py-2 pr-2">작성일</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-outline-variant last:border-none">
                    <td className="py-2.5 pr-2">
                      <span className="chip-primary">{CATEGORY_LABEL[p.category] ?? p.category}</span>
                    </td>
                    <td className="py-2.5 pr-2 max-w-xs truncate text-body-sm font-semibold">{p.title}</td>
                    <td className="py-2.5 pr-2 text-body-sm text-on-surface-variant">{p.nickname}</td>
                    <td className="py-2.5 pr-2 text-label-sm text-on-surface-variant">
                      {p.viewCount} / {p.likeCount}
                    </td>
                    <td className="py-2.5 pr-2 text-label-sm text-on-surface-variant">
                      {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        className="text-error text-label-sm font-bold"
                        onClick={() => {
                          if (confirm("이 게시글을 삭제할까요?")) deleteMutation.mutate(p.id);
                        }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
    </div>
  );
}
