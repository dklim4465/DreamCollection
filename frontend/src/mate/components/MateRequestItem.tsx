import dayjs from "dayjs";
import type { MateRequest } from "@/mate/types/mate";
import {
  MATE_REQUEST_STATUS_LABELS,
  type MateRequestStatus,
} from "@/mate/types/mate";

interface Props {
  request: MateRequest;
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  isDeciding?: boolean;
}

export default function MateRequestItem({
  request,
  onAccept,
  onReject,
  isDeciding,
}: Props) {
  const statusLabel =
    MATE_REQUEST_STATUS_LABELS[request.status as MateRequestStatus] ??
    request.status;
  const isPending = request.status === "REQUESTED";

  return (
    <div className="card-base p-stack-sm flex items-center justify-between">
      <div>
        <p className="text-label-md font-bold">신청자 #{request.requesterId}</p>
        <p className="text-label-sm text-outline">
          {dayjs(request.createdAt).format("YYYY.MM.DD HH:mm")} · {statusLabel}
        </p>
      </div>

      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => onReject(request.id)}
            disabled={isDeciding}
            className="btn-ghost disabled:opacity-50"
          >
            거절
          </button>
          <button
            onClick={() => onAccept(request.id)}
            disabled={isDeciding}
            className="btn-primary disabled:opacity-50"
          >
            수락
          </button>
        </div>
      )}
    </div>
  );
}
