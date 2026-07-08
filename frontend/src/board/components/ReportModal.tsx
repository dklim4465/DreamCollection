import { useState } from "react";
import type { ReportTargetType } from "@/board/types/board";

interface Props {
  targetType: ReportTargetType;
  targetId: number;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
}

export default function ReportModal({
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card-base bg-surface-container-lowest w-full max-w-sm p-stack-lg">
        <h3 className="text-headline-sm font-bold mb-stack-sm">신고하기</h3>
        <p className="text-body-md text-on-surface-variant mb-stack-md">
          신고 사유를 알려주세요. 허위 신고는 제재될 수 있어요.
        </p>
        <textarea
          className="input-base h-28 resize-none"
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
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? "접수 중..." : "신고 접수"}
          </button>
        </div>
      </div>
    </div>
  );
}
