// src/board/pages/BoardDetailPage.tsx
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  boardPostApi,
  boardImageApi,
  boardLikeApi,
  reportApi,
} from "@/board/api/board";
import { useAuthStore } from "@/auth/store/authStore";
import CommentSection from "@/board/components/CommentSection";
import UserProfileModal from "@/mate/components/UserProfileModal";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import EmptyState from "@/common/components/EmptyState";

export default function BoardDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const id = Number(postId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [reportTargetUserId, setReportTargetUserId] = useState<number | null>(
    null,
  );
  const [reportTargetLabel, setReportTargetLabel] = useState("");

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["board-post", postId],
    queryFn: () => boardPostApi.getDetail(id).then((res) => res.data.data),
  });

  const { data: images } = useQuery({
    queryKey: ["board-post-images", postId],
    queryFn: () => boardImageApi.getList(id).then((res) => res.data.data),
  });

  const isOwner = user != null && post != null && user.id === post.userId;

  const likeMutation = useMutation({
    mutationFn: () => boardLikeApi.toggle(id),
    onSuccess: (res) => {
      // 백엔드 응답이 { data: { liked, likeCount } } 형태가 아닐 수도 있으니
      // 서버가 준 값을 못 찾으면 캐시를 억지로 undefined로 덮어쓰지 않고,
      // 안전하게 목록/상세 쿼리를 다시 불러오는 쪽으로 폴백한다.
      const payload = res.data?.data;
      const nextLiked = payload?.liked;
      const nextLikeCount = payload?.likeCount;

      if (typeof nextLiked === "boolean" && typeof nextLikeCount === "number") {
        queryClient.setQueryData(["board-post", postId], (old: any) =>
          old
            ? {
                ...old,
                likeCount: nextLikeCount,
                liked: nextLiked,
              }
            : old,
        );
      } else {
        // 응답 구조가 예상과 다를 때를 대비한 안전망 — 서버에서 다시 받아온다.
        queryClient.invalidateQueries({ queryKey: ["board-post", postId] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => boardPostApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-posts"] });
      navigate("/community");
    },
  });

  const reportPostMutation = useMutation({
    mutationFn: (reason: string) =>
      reportApi.create({ targetType: "POST", targetId: id, reason }),
    onSuccess: () => alert("신고가 접수되었습니다."),
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "신고 접수에 실패했어요.");
    },
  });

  const handleReportPost = () => {
    const reason = prompt("신고 사유를 입력해주세요.");
    if (reason && reason.trim()) {
      reportPostMutation.mutate(reason.trim());
    }
  };

  if (isLoading) return <LoadingSpinner message="게시글을 불러오는 중..." />;

  if (isError || !post) {
    return (
      <EmptyState
        icon="⚠️"
        title="게시글을 찾을 수 없어요"
        description="삭제되었거나 잘못된 주소예요."
        action={
          <Link to="/community" className="btn-primary">
            목록으로
          </Link>
        }
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-stack-sm">
        <span className="chip-primary">{post.category}</span>
      </div>

      <h1 className="text-headline-md font-bold mb-2">{post.title}</h1>

      <div className="flex items-center justify-between mb-stack-md">
        <button
          onClick={() => {
            setReportTargetUserId(post.userId);
            setReportTargetLabel(post.nickname);
          }}
          className="flex items-center gap-2 hover:opacity-80"
        >
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
            {post.profileImageUrl ? (
              <img
                src={post.profileImageUrl}
                alt={post.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-lg">
                person
              </span>
            )}
          </div>
          <span className="text-label-md font-bold text-primary">
            {post.nickname}
          </span>
          <span className="text-label-sm text-outline">
            · {dayjs(post.createdAt).format("YYYY.MM.DD HH:mm")}
          </span>
        </button>
        <span className="text-label-sm text-outline">
          조회 {post.viewCount}
        </span>
      </div>

      {images && images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-stack-md">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.imageUrl}
              alt="첨부 이미지"
              className="w-40 h-40 object-cover rounded-lg border border-outline-variant"
            />
          ))}
        </div>
      )}

      <div className="card-base p-stack-md mb-stack-md">
        <p className="text-body-md whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="flex items-center justify-between mb-stack-lg">
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-label-md text-on-surface-variant hover:bg-surface-container disabled:opacity-50 transition-colors"
        >
          <span
            className={`material-symbols-outlined text-lg ${
              post.liked ? "text-error" : ""
            }`}
            style={
              post.liked ? { fontVariationSettings: "'FILL' 1" } : undefined
            }
          >
            favorite
          </span>
          좋아요 {post.likeCount}
        </button>

        <div className="flex items-center gap-3">
          {isOwner ? (
            <>
              <Link to={`/community/${post.id}/edit`} className="btn-ghost">
                수정
              </Link>
              <button
                onClick={() =>
                  confirm("게시글을 삭제할까요?") && deleteMutation.mutate()
                }
                className="btn-ghost text-error"
              >
                삭제
              </button>
            </>
          ) : (
            <button
              onClick={handleReportPost}
              className="text-label-sm text-on-surface-variant hover:text-error"
            >
              신고
            </button>
          )}
        </div>
      </div>

      <CommentSection
        postId={id}
        currentUserId={user?.id ?? null}
        onReportUser={(userId, label) => {
          setReportTargetUserId(userId);
          setReportTargetLabel(label);
        }}
      />

      {reportTargetUserId != null && (
        <UserProfileModal
          userId={reportTargetUserId}
          label={reportTargetLabel}
          onClose={() => setReportTargetUserId(null)}
        />
      )}
    </div>
  );
}
