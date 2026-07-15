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
import LoadingSpinner from "@/common/component/LoadingSpinner";
import EmptyState from "@/common/component/EmptyState";

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
      queryClient.setQueryData(["board-post", postId], (old: any) => ({
        ...old,
        likeCount: res.data.data.likeCount,
      }));
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
            setReportTargetLabel(`작성자 #${post.userId}`);
          }}
          className="flex items-center gap-2 hover:opacity-80"
        >
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">
              person
            </span>
          </div>
          <span className="text-label-md font-bold text-primary">
            작성자 #{post.userId}
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
          className="btn-ghost flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-lg">favorite</span>
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
