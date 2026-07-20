import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type MainBackgroundAdminForm, type MainBackgroundItem } from "@/admin/api/adminApi";
import ImageUrlOrUploadInput from "@/admin/ImageUrlOrUploadInput";

const EMPTY_FORM: MainBackgroundAdminForm = { mediaType: "IMAGE", mediaUrl: "" };

export default function AdminMainBackgroundsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "main-backgrounds"],
    queryFn: adminApi.getMainBackgrounds,
  });
  const items = data?.data?.data ?? [];

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MainBackgroundAdminForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "main-backgrounds"] });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createMainBackground(form),
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "등록에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) => adminApi.updateMainBackground(id, form),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteMainBackground(id),
    onSuccess: invalidate,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (item: MainBackgroundItem) =>
      adminApi.updateMainBackground(item.id, {
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        active: !item.active,
      }),
    onSuccess: invalidate,
  });

  const startEdit = (item: MainBackgroundItem) => {
    setEditingId(item.id);
    setForm({ mediaType: item.mediaType, mediaUrl: item.mediaUrl, active: item.active });
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
      <div>
        <h1 className="text-headline-md font-bold">메인 배경 관리</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          홈 화면 상단 배경(여러 장이면 자동으로 순환 슬라이드)에 노출돼요. 이미지/영상 둘 다 가능해요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold">{editingId ? "배경 수정" : "새 배경 등록"}</h2>
        {error && <p className="text-body-sm text-error">{error}</p>}
        <select
          className="input-base"
          value={form.mediaType}
          onChange={(e) => setForm({ ...form, mediaType: e.target.value as "IMAGE" | "VIDEO" })}
        >
          <option value="IMAGE">이미지</option>
          <option value="VIDEO">영상 (mp4)</option>
        </select>
        {form.mediaType === "IMAGE" ? (
          <ImageUrlOrUploadInput
            value={form.mediaUrl}
            onChange={(url) => setForm({ ...form, mediaUrl: url })}
            placeholder="이미지 URL (또는 파일 선택으로 업로드)"
          />
        ) : (
          <input
            className="input-base"
            placeholder="영상(mp4) URL — 파일 업로드는 이미지만 지원해요"
            value={form.mediaUrl}
            onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
            required
          />
        )}
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
        <h2 className="text-headline-sm font-bold mb-stack-sm">등록된 배경 ({items.length})</h2>
        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            등록된 배경이 없어요. 지금은 홈 화면에 기본 배경 4장이 대신 나오고 있어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant">
                {item.mediaType === "VIDEO" ? (
                  <div className="w-16 h-16 rounded-md shrink-0 bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">movie</span>
                  </div>
                ) : (
                  <img src={item.mediaUrl} alt="" className="w-16 h-16 object-cover rounded-md shrink-0 bg-surface-container-low" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold truncate">{item.mediaUrl}</p>
                  <p className="text-label-sm text-on-surface-variant">{item.mediaType}</p>
                </div>
                <button
                  onClick={() => toggleActiveMutation.mutate(item)}
                  className={`chip-${item.active ? "primary" : "tertiary"} shrink-0`}
                >
                  {item.active ? "노출중" : "비노출"}
                </button>
                <button className="btn-ghost text-sm py-1.5 px-3 shrink-0" onClick={() => startEdit(item)}>
                  수정
                </button>
                <button
                  className="text-error text-label-sm font-bold shrink-0"
                  onClick={() => {
                    if (confirm("이 배경을 삭제할까요?")) deleteMutation.mutate(item.id);
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
