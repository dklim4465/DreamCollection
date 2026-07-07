import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type NoticeAdminForm, type NoticeItem } from "@/admin/api/adminApi";

const EMPTY_FORM: NoticeAdminForm = { title: "", content: "", pinned: false };

export default function AdminNoticesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "notices"],
    queryFn: adminApi.getNotices,
  });
  const notices = data?.data?.data ?? [];

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<NoticeAdminForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createNotice(form),
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "등록에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) => adminApi.updateNotice(id, form),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteNotice(id),
    onSuccess: invalidate,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (n: NoticeItem) =>
      adminApi.updateNotice(n.id, { title: n.title, content: n.content, pinned: n.pinned, active: !n.active }),
    onSuccess: invalidate,
  });

  const startEdit = (n: NoticeItem) => {
    setEditingId(n.id);
    setForm({ title: n.title, content: n.content, pinned: n.pinned, active: n.active });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (editingId) updateMutation.mutate(editingId);
    else createMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-stack-lg">
      <h1 className="text-headline-md font-bold">공지사항 관리</h1>

      <form onSubmit={handleSubmit} className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold">{editingId ? "공지 수정" : "새 공지 등록"}</h2>
        {error && <p className="text-body-sm text-error">{error}</p>}
        <input
          className="input-base"
          placeholder="제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="input-base min-h-32"
          placeholder="내용"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <label className="flex items-center gap-2 text-body-sm">
          <input
            type="checkbox"
            checked={!!form.pinned}
            onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
          />
          상단 고정
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
            {editingId ? "수정 저장" : "등록"}
          </button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={cancelEdit}>
              취소
            </button>
          )}
        </div>
      </form>

      <div className="card-base p-stack-lg">
        <h2 className="text-headline-sm font-bold mb-stack-sm">등록된 공지 ({notices.length})</h2>
        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
        ) : notices.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">등록된 공지사항이 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notices.map((n) => (
              <li key={n.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-outline-variant">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {n.pinned && <span className="chip-tertiary text-[10px]">고정</span>}
                    <p className="text-body-sm font-semibold truncate">{n.title}</p>
                  </div>
                  <p className="text-label-sm text-on-surface-variant truncate mt-0.5">{n.content}</p>
                </div>
                <button
                  onClick={() => toggleActiveMutation.mutate(n)}
                  className={`chip-${n.active ? "primary" : "tertiary"} shrink-0`}
                >
                  {n.active ? "노출중" : "비노출"}
                </button>
                <button className="btn-ghost text-sm py-1.5 px-3 shrink-0" onClick={() => startEdit(n)}>
                  수정
                </button>
                <button
                  className="text-error text-label-sm font-bold shrink-0"
                  onClick={() => {
                    if (confirm("이 공지사항을 삭제할까요?")) deleteMutation.mutate(n.id);
                  }}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
