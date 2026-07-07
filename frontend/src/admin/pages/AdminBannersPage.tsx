import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type BannerAdminForm } from "@/admin/api/adminApi";
import type { Banner } from "@/home/api/bannerApi";

const EMPTY_FORM: BannerAdminForm = { title: "", imageUrl: "", linkUrl: "", displayOrder: 0 };

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: adminApi.getBanners,
  });
  const banners = data?.data?.data ?? [];

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerAdminForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createBanner(form),
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "등록에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) => adminApi.updateBanner(id, form),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBanner(id),
    onSuccess: invalidate,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (b: Banner) =>
      adminApi.updateBanner(b.id, {
        title: b.title,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl ?? "",
        displayOrder: b.displayOrder,
        active: !b.active,
      }),
    onSuccess: invalidate,
  });

  const startEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? "",
      displayOrder: b.displayOrder,
      active: b.active,
    });
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
      <h1 className="text-headline-md font-bold">배너 관리</h1>

      <form onSubmit={handleSubmit} className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold">{editingId ? "배너 수정" : "새 배너 등록"}</h2>
        {error && <p className="text-body-sm text-error">{error}</p>}
        <input
          className="input-base"
          placeholder="제목 (관리용, 화면 미노출)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          className="input-base"
          placeholder="이미지 URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          required
        />
        <input
          className="input-base"
          placeholder="클릭 시 이동할 URL (선택)"
          value={form.linkUrl}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
        />
        <input
          type="number"
          className="input-base"
          placeholder="노출 순서 (작을수록 먼저)"
          value={form.displayOrder}
          onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
        />
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
        <h2 className="text-headline-sm font-bold mb-stack-sm">등록된 배너 ({banners.length})</h2>
        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
        ) : banners.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">등록된 배너가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {banners.map((b) => (
              <li key={b.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant">
                <img src={b.imageUrl} alt={b.title} className="w-16 h-16 object-cover rounded-md shrink-0 bg-surface-container-low" />
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold truncate">{b.title}</p>
                  <p className="text-label-sm text-on-surface-variant">순서 {b.displayOrder}</p>
                </div>
                <button
                  onClick={() => toggleActiveMutation.mutate(b)}
                  className={`chip-${b.active ? "primary" : "tertiary"} shrink-0`}
                >
                  {b.active ? "노출중" : "비노출"}
                </button>
                <button className="btn-ghost text-sm py-1.5 px-3 shrink-0" onClick={() => startEdit(b)}>
                  수정
                </button>
                <button
                  className="text-error text-label-sm font-bold shrink-0"
                  onClick={() => {
                    if (confirm("이 배너를 삭제할까요?")) deleteMutation.mutate(b.id);
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
