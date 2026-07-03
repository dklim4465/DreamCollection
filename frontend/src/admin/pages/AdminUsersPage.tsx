import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminUser } from "@/admin/api/adminApi";

const STATUS_LABEL: Record<AdminUser["status"], { label: string; className: string }> = {
  ACTIVE: { label: "정상", className: "chip-primary" },
  SUSPENDED: { label: "정지", className: "chip-tertiary" },
  WITHDRAWN: { label: "탈퇴", className: "chip-tertiary" },
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", keyword, page],
    queryFn: () => adminApi.getUsers(keyword, page, 20),
  });

  const result = data?.data?.data;
  const users = result?.content ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminUser["status"] }) =>
      adminApi.changeUserStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  return (
    <div className="flex flex-col gap-stack-lg">
      <h1 className="text-headline-md font-bold">회원 관리</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input-base flex-1"
          placeholder="이메일 또는 닉네임으로 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0">
          검색
        </button>
      </form>

      <div className="card-base p-stack-lg">
        <div className="flex items-center justify-between mb-stack-sm">
          <h2 className="text-headline-sm font-bold">
            회원 목록 {result ? `(총 ${result.totalElements}명)` : ""}
          </h2>
        </div>

        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
        ) : users.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">검색 결과가 없어요.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="text-left text-label-sm text-on-surface-variant border-b border-outline-variant">
                  <th className="py-2 pr-3">이메일</th>
                  <th className="py-2 pr-3">닉네임</th>
                  <th className="py-2 pr-3">권한</th>
                  <th className="py-2 pr-3">상태</th>
                  <th className="py-2 pr-3">가입일</th>
                  <th className="py-2 pr-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const status = STATUS_LABEL[u.status];
                  return (
                    <tr key={u.id} className="border-b border-outline-variant last:border-none">
                      <td className="py-2.5 pr-3">{u.email}</td>
                      <td className="py-2.5 pr-3">{u.nickname}</td>
                      <td className="py-2.5 pr-3">
                        {u.role === "ADMIN" ? (
                          <span className="chip-tertiary">관리자</span>
                        ) : (
                          <span className="text-on-surface-variant">일반</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className={status.className}>{status.label}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="py-2.5 pr-3">
                        {u.status === "SUSPENDED" ? (
                          <button
                            className="text-primary text-label-sm font-bold"
                            onClick={() => statusMutation.mutate({ id: u.id, status: "ACTIVE" })}
                          >
                            정지 해제
                          </button>
                        ) : u.status === "ACTIVE" ? (
                          <button
                            className="text-error text-label-sm font-bold"
                            onClick={() => {
                              if (confirm(`${u.nickname}님을 정지시킬까요?`))
                                statusMutation.mutate({ id: u.id, status: "SUSPENDED" });
                            }}
                          >
                            정지
                          </button>
                        ) : (
                          <span className="text-on-surface-variant text-label-sm">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-stack-md">
            <button
              className="btn-ghost text-sm py-1.5 px-3"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </button>
            <span className="text-label-sm text-on-surface-variant">
              {page + 1} / {result.totalPages}
            </span>
            <button
              className="btn-ghost text-sm py-1.5 px-3"
              disabled={page >= result.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
