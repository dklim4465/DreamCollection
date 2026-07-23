import { useState, type KeyboardEvent } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardCommentApi } from "@/board/api/boardApi";
import type { BoardComment } from "@/board/types/board";
import ReportModal from "./ReportModal";
import { reportApi } from "@/board/api/boardApi";

interface Props {
  postId: number;
  currentUserId: number | null;
  onReportUser: (userId: number, label: string) => void;
}

export default function CommentSection({
  postId,
  currentUserId,
  onReportUser,
}: Props) {
  const queryClient = useQueryClient();
  const queryKey = ["board-comments", postId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => boardCommentApi.getList(postId).then((res) => res.data.data),
  });

  const [newContent, setNewContent] = useState("");
  const [replyTo, setReplyTo] = useState<{
    anchorCommentId: number;
    topParentId: number;
    targetUserId: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: {
      content: string;
      parentCommentId?: number | null;
    }) => boardCommentApi.create(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setNewContent("");
      setReplyTo(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "댓글 등록에 실패했어요.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { commentId: number; content: string }) =>
      boardCommentApi.update(postId, payload.commentId, {
        content: payload.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditingId(null);
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "댓글 수정에 실패했어요.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) =>
      boardCommentApi.delete(postId, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "댓글 삭제에 실패했어요.");
    },
  });

  const reportMutation = useMutation({
    mutationFn: (payload: { targetId: number; reason: string }) =>
      reportApi.create({
        targetType: "COMMENT",
        targetId: payload.targetId,
        reason: payload.reason,
      }),
    onSuccess: () => setReportTargetId(null),
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "신고 접수에 실패했어요.");
      setReportTargetId(null);
    },
  });

  const comments = data ?? [];
  const topLevel = comments.filter((c) => c.parentCommentId == null);
  const repliesOf = (parentId: number) =>
    comments.filter((c) => c.parentCommentId === parentId);

  const resolveTopParentId = (comment: BoardComment) =>
    comment.parentCommentId == null ? comment.id : comment.parentCommentId;

  const submitNewComment = () => {
    if (!newContent.trim()) return;
    createMutation.mutate({ content: newContent.trim() });
  };

  const submitReply = () => {
    if (!newContent.trim() || !replyTo) return;
    createMutation.mutate({
      content: newContent.trim(),
      parentCommentId: replyTo.topParentId,
    });
  };

  const submitEdit = (commentId: number) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ commentId, content: editContent.trim() });
  };

  const handleEnterKey =
    (submitFn: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submitFn();
      }
    };

  const renderComment = (comment: BoardComment, isReply = false) => {
    const isOwner = currentUserId != null && comment.userId === currentUserId;
    const isEditing = editingId === comment.id;
    const isReplyingHere = replyTo?.anchorCommentId === comment.id;

    return (
      <div key={comment.id} className={isReply ? "ml-8 mt-3" : "mt-4"}>
        <div className="card-base p-stack-sm">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => onReportUser(comment.userId, comment.nickname)}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
                {comment.profileImageUrl ? (
                  <img
                    src={comment.profileImageUrl}
                    alt={comment.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-primary text-sm">
                    person
                  </span>
                )}
              </div>
              <span className="text-label-sm font-bold text-primary">
                {comment.nickname}
              </span>
            </button>
            <span className="text-label-sm text-outline">
              {dayjs(comment.createdAt).format("YYYY.MM.DD HH:mm")}
            </span>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                className="input-base h-20 resize-none"
                value={editContent}
                maxLength={500}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingId(null)}
                  className="text-label-sm text-on-surface-variant"
                >
                  취소
                </button>
                <button
                  onClick={() => submitEdit(comment.id)}
                  className="text-label-sm text-primary font-bold"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <p className="text-body-md whitespace-pre-wrap ml-8">
              {isReply && (
                <span className="text-primary font-bold mr-1">
                  @{comment.nickname}
                </span>
              )}
              {comment.content}
            </p>
          )}

          {!isEditing && (
            <div className="flex gap-3 mt-2 ml-8 text-label-sm text-on-surface-variant">
              {currentUserId != null && (
                <button
                  onClick={() =>
                    setReplyTo({
                      anchorCommentId: comment.id,
                      topParentId: resolveTopParentId(comment),
                      targetUserId: comment.userId,
                    })
                  }
                  className="hover:text-primary"
                >
                  답글
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="hover:text-primary"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("댓글을 삭제할까요?"))
                        deleteMutation.mutate(comment.id);
                    }}
                    className="hover:text-error"
                  >
                    삭제
                  </button>
                </>
              )}
              {!isOwner && currentUserId != null && (
                <button
                  onClick={() => setReportTargetId(comment.id)}
                  className="hover:text-error"
                >
                  댓글 신고
                </button>
              )}
            </div>
          )}
        </div>

        {isReplyingHere && (
          <div className="ml-8 mt-2 flex gap-2">
            <input
              className="input-base"
              placeholder={`${comment.nickname}님에게 답글 작성`}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={handleEnterKey(submitReply)}
            />
            <button
              onClick={submitReply}
              className="btn-primary whitespace-nowrap"
            >
              등록
            </button>
          </div>
        )}

        {!isReply &&
          repliesOf(comment.id).map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <section className="mt-stack-lg">
      <h3 className="text-headline-sm font-bold mb-stack-sm">
        댓글 {comments.length}
      </h3>

      {currentUserId != null ? (
        <div className="flex gap-2">
          <input
            className="input-base"
            placeholder="댓글을 입력하세요"
            value={replyTo == null ? newContent : ""}
            onChange={(e) => {
              setReplyTo(null);
              setNewContent(e.target.value);
            }}
            onKeyDown={handleEnterKey(submitNewComment)}
          />
          <button
            onClick={submitNewComment}
            className="btn-primary whitespace-nowrap"
          >
            등록
          </button>
        </div>
      ) : (
        <p className="text-label-md text-on-surface-variant">
          댓글을 쓰려면 로그인해주세요.
        </p>
      )}

      {isLoading && (
        <p className="text-label-md text-on-surface-variant mt-4">
          불러오는 중...
        </p>
      )}
      {!isLoading && comments.length === 0 && (
        <p className="text-label-md text-on-surface-variant mt-4">
          첫 댓글을 남겨보세요!
        </p>
      )}

      {topLevel.map((comment) => renderComment(comment))}

      {reportTargetId != null && (
        <ReportModal
          targetType="COMMENT"
          targetId={reportTargetId}
          isSubmitting={reportMutation.isPending}
          onClose={() => setReportTargetId(null)}
          onSubmit={(reason) =>
            reportMutation.mutate({ targetId: reportTargetId, reason })
          }
        />
      )}
    </section>
  );
}
