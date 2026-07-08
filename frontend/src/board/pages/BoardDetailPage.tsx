import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  boardPostApi,
  boardLikeApi,
  boardImageApi,
  reportApi,
} from "@/board/api/board";
import { useAuthStore } from "@/store/authStore";
import {
  BOARD_CATEGORY_LABELS,
  TRADE_STATUS_LABELS,
  type BoardCategory,
} from "@/board/types/board";
import CommentSection from "@/board/components/CommentSection";
import ReportModal from "@/board/components/ReportModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";

export default function BoardDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const id = Number(postId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [showReport, setShowReport] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["board-post", postId],
    queryFn: () => boardPostApi.getDetail(id).then((res) => res.data.data),
  });

  const { data: images } = useQuery({
    queryKey: ["board-images", postId],
    queryFn: () => boardImageApi.getList(id).then((res) => res.data.data),
  });

  const [likeState, setLikeState] = useState<{
    liked: boolean;
    likeCount: number;
  } | null>(null);

  const likeMutation = useMutation({
    mutationFn: () => boardLikeApi.toggle(id),
    onSuccess: (res) => setLikeState(res.data.data),
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "좋아요 처리에 실패했어요.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => boardPostApi.delete(id),
    onSuccess: () => navigate("/community"),
  });

  const addImageMutation = useMutation({
    mutationFn: () => boardImageApi.add(id, { imageUrl: newImageUrl.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-images", postId] });
      setNewImageUrl("");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => boardImageApi.delete(id, imageId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["board-images", postId] }),
  });

  const reportMutation = useMutation({
    mutationFn: (reason: string) =>
      reportApi.create({ targetType: "POST", targetId: id, reason }),
    onSuccess: () => setShowReport(false),
    onError: () => setShowReport(false),
  });

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

  const isOwner = user != null && user.id === post.userId;
  const categoryLabel =
    BOARD_CATEGORY_LABELS[post.category as BoardCategory] ?? post.category;
  const likeCount = likeState?.likeCount ?? post.likeCount;
  const liked = likeState?.liked ?? false;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-stack-sm">
        <span className="chip-primary">{categoryLabel}</span>
        {post.tradeStatus && (
          <span className="chip bg-surface-container text-on-surface-variant">
            {TRADE_STATUS_LABELS[post.tradeStatus] ?? post.tradeStatus}
          </span>
        )}
      </div>

      <h1 className="text-headline-md font-bold mb-2">{post.title}</h1>

      <div className="flex items-center justify-between text-label-sm text-outline mb-stack-md">
        <span>
          작성자 #{post.userId} ·{" "}
          {dayjs(post.createdAt).format("YYYY.MM.DD HH:mm")}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">visibility</span>
          {post.viewCount}
        </span>
      </div>

      {post.price != null && (
        <p className="text-headline-sm font-bold text-primary mb-stack-md">
          {post.price.toLocaleString()}원
        </p>
      )}

      <div className="card-base p-stack-md mb-stack-md">
        <p className="text-body-md whitespace-pre-wrap">{post.content}</p>
      </div>

      {images && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-stack-md">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden group"
            >
              <img
                src={img.imageUrl}
                alt=""
                className="w-full h-32 object-cover"
              />
              {isOwner && (
                <button
                  onClick={() => deleteImageMutation.mutate(img.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <div className="flex gap-2 mb-stack-md">
          <input
            className="input-base"
            placeholder="이미지 URL을 입력하세요"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
          <button
            onClick={() => newImageUrl.trim() && addImageMutation.mutate()}
            disabled={!newImageUrl.trim() || addImageMutation.isPending}
            className="btn-ghost whitespace-nowrap disabled:opacity-50"
          >
            이미지 추가
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-stack-lg">
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={
            liked
              ? "flex items-center gap-1 chip bg-error/10 text-error"
              : "flex items-center gap-1 chip bg-surface-container text-on-surface-variant"
          }
        >
          <span
            className="material-symbols-outlined text-lg"
            style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            favorite
          </span>
          좋아요 {likeCount}
        </button>

        <div className="ml-auto flex gap-3 text-label-sm">
          {isOwner ? (
            <>
              <Link
                to={`/community/${post.id}/edit`}
                className="text-on-surface-variant hover:text-primary"
              >
                수정
              </Link>
              <button
                onClick={() =>
                  confirm("게시글을 삭제할까요?") && deleteMutation.mutate()
                }
                className="text-on-surface-variant hover:text-error"
              >
                삭제
              </button>
            </>
          ) : (
            user != null && (
              <button
                onClick={() => setShowReport(true)}
                className="text-on-surface-variant hover:text-error"
              >
                신고
              </button>
            )
          )}
        </div>
      </div>

      <CommentSection postId={id} currentUserId={user?.id ?? null} />

      {showReport && (
        <ReportModal
          targetType="POST"
          targetId={id}
          isSubmitting={reportMutation.isPending}
          onClose={() => setShowReport(false)}
          onSubmit={(reason) => reportMutation.mutate(reason)}
        />
      )}
    </div>
  );
}
