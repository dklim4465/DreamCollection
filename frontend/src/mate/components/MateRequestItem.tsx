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
  onClickRequester: (userId: number, label: string, status: string) => void;
  isDeciding?: boolean;
}

export default function MateRequestItem({
  request,
  onAccept,
  onReject,
  onClickRequester,
  isDeciding,
}: Props) {
  const statusLabel =
    MATE_REQUEST_STATUS_LABELS[request.status as MateRequestStatus] ??
    request.status;
  const isPending = request.status === "REQUESTED";

  return (
    <div className="card-base p-stack-sm flex items-center justify-between">
      <div className="flex-1">
        <button
          onClick={() =>
            onClickRequester(
              request.requesterId,
              request.nickname,
              request.status,
            )
          }
          className="flex items-center gap-2 hover:opacity-80"
        >
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
            {request.profileImageUrl ? (
              <img
                src={request.profileImageUrl}
                alt={request.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-lg">
                person
              </span>
            )}
          </div>
          <span className="text-label-md font-bold text-primary">
            {request.nickname}
          </span>
        </button>
        {request.message && (
          <p className="text-label-md text-on-surface mt-1 ml-10">
            {request.message}
          </p>
        )}
        <p className="text-label-sm text-outline mt-1 ml-10">
          {dayjs(request.createdAt).format("YYYY.MM.DD HH:mm")} · {statusLabel}
        </p>
      </div>

      {isPending && (
        <div className="flex gap-2 shrink-0">
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
