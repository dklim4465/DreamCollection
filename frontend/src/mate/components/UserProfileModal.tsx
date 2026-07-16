import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { mateReviewApi } from "@/mate/api/mate";
import { reportApi } from "@/board/api/board";
import { chatApi } from "@/chat/api/chatApi";
import { useChatStore } from "@/chat/store/chatStore";

interface Props {
  userId: number;
  label: string;
  matePostId: number;
  canChat: boolean;
  onClose: () => void;
}

export default function UserProfileModal({
  userId,
  label,
  matePostId,
  canChat,
  onClose,
}: Props) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const { openRoom, toggleWidget, setRooms } = useChatStore();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["mate-reviews-for-user", userId],
    queryFn: () =>
      mateReviewApi.getForUser(userId).then((res) => res.data.data),
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      reportApi.create({
        targetType: "USER",
        targetId: userId,
        reason: reportReason.trim(),
      }),
    onSuccess: () => {
      alert("신고가 접수되었습니다.");
      setShowReportForm(false);
      setReportReason("");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "신고 접수에 실패했어요.");
    },
  });

  const handleOpenChat = async () => {
    setIsOpeningChat(true);
    try {
      const res = await chatApi.openRoom(matePostId);
      const roomId = res.data.data;

      const roomsRes = await chatApi.getMyRooms();
      setRooms(roomsRes.data.data);
      openRoom(roomId);
      toggleWidget();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "채팅방을 열지 못했어요.");
    } finally {
      setIsOpeningChat(false);
    }
  };

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="card-base bg-surface-container-lowest w-full max-w-sm p-stack-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-stack-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">
                person
              </span>
            </div>
            <div>
              <p className="text-label-lg font-bold">{label}</p>
              {avgRating && (
                <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                  <span className="text-primary">★</span>
                  <span>
                    {avgRating} · 후기 {reviews?.length}개
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {canChat && (
          <button
            onClick={handleOpenChat}
            disabled={isOpeningChat}
            className="btn-primary w-full flex items-center justify-center gap-1 mb-stack-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            {isOpeningChat ? "여는 중..." : "채팅하기"}
          </button>
        )}

        <div className="border-t border-outline-variant pt-stack-sm flex flex-col gap-2 mb-stack-md max-h-64 overflow-y-auto">
          <p className="text-label-sm font-bold text-on-surface-variant">
            받은 후기
          </p>

          {isLoading && (
            <p className="text-label-sm text-on-surface-variant">
              불러오는 중...
            </p>
          )}

          {!isLoading && reviews && reviews.length === 0 && (
            <p className="text-label-sm text-on-surface-variant">
              아직 받은 후기가 없어요.
            </p>
          )}

          {reviews?.map((review) => (
            <div key={review.id} className="card-base p-stack-sm">
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={
                      n <= review.rating
                        ? "text-primary"
                        : "text-outline-variant"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              {review.content && (
                <p className="text-body-sm">{review.content}</p>
              )}
            </div>
          ))}
        </div>

        {showReportForm ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="input-base h-20 resize-none"
              placeholder="신고 사유 (최대 255자)"
              maxLength={255}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportForm(false)}
                className="btn-ghost"
              >
                취소
              </button>
              <button
                onClick={() => reportMutation.mutate()}
                disabled={!reportReason.trim() || reportMutation.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {reportMutation.isPending ? "접수 중..." : "신고 접수"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReportForm(true)}
            className="btn-ghost text-error w-full"
          >
            신고하기
          </button>
        )}
      </div>
    </div>
  );
}
