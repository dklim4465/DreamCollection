import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type MonthlyDestinationAdminForm } from "@/admin/api/adminApi";
import type { MonthlyDestinationItem } from "@/home/api/monthlyDestinationApi";

function currentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const EMPTY_FORM: MonthlyDestinationAdminForm = {
  displayMonth: currentMonthString(),
  destinationName: "",
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  displayOrder: 0,
};

export default function AdminMonthlyDestinationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "monthly-destinations"],
    queryFn: adminApi.getMonthlyDestinations,
  });
  const items = data?.data?.data ?? [];

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MonthlyDestinationAdminForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "monthly-destinations"] });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createMonthlyDestination(form),
    onSuccess: () => {
      invalidate();
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "등록에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) => adminApi.updateMonthlyDestination(id, form),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? "수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteMonthlyDestination(id),
    onSuccess: invalidate,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (item: MonthlyDestinationItem) =>
      adminApi.updateMonthlyDestination(item.id, {
        displayMonth: item.displayMonth,
        destinationName: item.destinationName,
        title: item.title,
        description: item.description ?? "",
        imageUrl: item.imageUrl,
        linkUrl: item.linkUrl ?? "",
        displayOrder: item.displayOrder,
        active: !item.active,
      }),
    onSuccess: invalidate,
  });

  const startEdit = (item: MonthlyDestinationItem) => {
    setEditingId(item.id);
    setForm({
      displayMonth: item.displayMonth,
      destinationName: item.destinationName,
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl ?? "",
      displayOrder: item.displayOrder,
      active: item.active,
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
      <div>
        <h1 className="text-headline-md font-bold">이달의 여행지 관리</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          "노출 연월"이 이번 달인 항목만 홈 화면(BEST10 · 추천 캐러셀)에 자동으로 노출돼요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-base p-stack-lg flex flex-col gap-stack-sm">
        <h2 className="text-headline-sm font-bold">{editingId ? "여행지 수정" : "새 여행지 등록"}</h2>
        {error && <p className="text-body-sm text-error">{error}</p>}
        <input
          className="input-base"
          placeholder="노출 연월 (예: 2026-07)"
          value={form.displayMonth}
          onChange={(e) => setForm({ ...form, displayMonth: e.target.value })}
          required
        />
        <input
          className="input-base"
          placeholder="여행지명 (예: 제주도)"
          value={form.destinationName}
          onChange={(e) => setForm({ ...form, destinationName: e.target.value })}
          required
        />
        <input
          className="input-base"
          placeholder="카드 제목/캐치프레이즈"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="input-base"
          placeholder="설명 (선택)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
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
          placeholder="노출 순서 (작을수록 먼저, BEST10 순위)"
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
        <h2 className="text-headline-sm font-bold mb-stack-sm">등록된 여행지 ({items.length})</h2>
        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">등록된 여행지가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant">
                <img src={item.imageUrl} alt="" className="w-14 h-14 object-cover rounded-md shrink-0 bg-surface-container-low" />
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold truncate">
                    {item.destinationName} · {item.title}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    {item.displayMonth} · 순서 {item.displayOrder}
                  </p>
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
                    if (confirm("이 여행지를 삭제할까요?")) deleteMutation.mutate(item.id);
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
