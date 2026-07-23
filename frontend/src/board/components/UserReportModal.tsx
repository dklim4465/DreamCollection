import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { reportApi } from "@/board/api/boardApi";

interface Props {
  userId: number;
  label: string;
  onClose: () => void;
}

export default function UserReportModal({ userId, label, onClose }: Props) {
  const [reason, setReason] = useState("");

  const reportMutation = useMutation({
    mutationFn: () =>
      reportApi.create({
        targetType: "USER",
        targetId: userId,
        reason: reason.trim(),
      }),
    onSuccess: () => {
      alert("신고가 접수되었습니다.");
      onClose();
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "신고 접수에 실패했어요.");
    },
  });

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="card-base bg-surface-container-lowest w-full max-w-sm p-stack-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-stack-md">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">
              person
            </span>
          </div>
          <p className="text-label-lg font-bold">{label}</p>
        </div>

        <p className="text-body-md text-on-surface-variant mb-stack-sm">
          신고 사유를 알려주세요. 허위 신고는 제재될 수 있어요.
        </p>
        <textarea
          className="input-base h-24 resize-none"
          placeholder="신고 사유 (최대 255자)"
          maxLength={255}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-stack-md">
          <button onClick={onClose} className="btn-ghost">
            취소
          </button>
          <button
            onClick={() => reportMutation.mutate()}
            disabled={!reason.trim() || reportMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {reportMutation.isPending ? "접수 중..." : "신고 접수"}
          </button>
        </div>
      </div>
    </div>
  );
}
