import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matePostApi, mateRequestApi } from "@/mate/api/mateApi";
import {
  MATE_POST_STATUS_LABELS,
  type MatePostStatus,
} from "@/mate/types/mate";
import { useAuthStore } from "@/auth/store/authStore";
import MateRequestItem from "@/mate/components/MateRequestItem";
import MateReviewSection from "@/mate/components/MateReviewSection";
import UserProfileModal from "@/mate/components/UserProfileModal";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import EmptyState from "@/common/components/EmptyState";

export default function MateDetailPage() {
  const { matePostId } = useParams<{ matePostId: string }>();
  const id = Number(matePostId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [applyMessage, setApplyMessage] = useState("");
  const [profileTarget, setProfileTarget] = useState<{
    userId: number;
    label: string;
    canChat: boolean;
  } | null>(null);

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mate-post", matePostId],
    queryFn: () => matePostApi.getDetail(id).then((res) => res.data.data),
  });

  const isOwner = user != null && post != null && user.id === post.userId;

  const { data: requests } = useQuery({
    queryKey: ["mate-requests", matePostId],
    queryFn: () => mateRequestApi.getList(id).then((res) => res.data.data),
    enabled: isOwner,
  });

  const { data: myRequests } = useQuery({
    queryKey: ["mate-my-requests"],
    queryFn: () => mateRequestApi.getMyRequests().then((res) => res.data.data),
    enabled: !isOwner && user != null,
  });
  const myRequest = myRequests?.find((r) => r.matePostId === id);

  const applyMutation = useMutation({
    mutationFn: (message: string) => mateRequestApi.apply(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mate-my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setApplyMessage("");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "신청에 실패했어요.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: number) => mateRequestApi.cancel(id, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mate-my-requests"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "신청 취소에 실패했어요.");
    },
  });

  const decideMutation = useMutation({
    mutationFn: ({
      requestId,
      decision,
    }: {
      requestId: number;
      decision: "ACCEPT" | "REJECT";
    }) => mateRequestApi.decide(id, requestId, { decision }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mate-requests", matePostId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => matePostApi.delete(id),
    onSuccess: () => navigate("/matching"),
  });

  if (isLoading) return <LoadingSpinner message="모집글을 불러오는 중..." />;

  if (isError || !post) {
    return (
      <EmptyState
        icon="⚠️"
        title="모집글을 찾을 수 없어요"
        description="삭제되었거나 잘못된 주소예요."
        action={
          <Link to="/matching" className="btn-primary">
            목록으로
          </Link>
        }
      />
    );
  }

  const statusLabel =
    MATE_POST_STATUS_LABELS[post.status as MatePostStatus] ?? post.status;

  const tripNotStarted = dayjs(post.startDate).isAfter(dayjs());

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-stack-sm">
        <span className="chip-primary">{statusLabel}</span>
        {post.travelStyle && (
          <span className="chip bg-surface-container text-on-surface-variant">
            {post.travelStyle}
          </span>
        )}
      </div>

      <h1 className="text-headline-md font-bold mb-2">{post.destination}</h1>

      <div className="flex items-center gap-3 mb-stack-md flex-wrap">
        <button
          onClick={() =>
            setProfileTarget({
              userId: post.userId,
              label: post.nickname,
              canChat: !isOwner && myRequest != null,
            })
          }
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
        </button>
        <span className="text-label-sm text-outline">
          {dayjs(post.startDate).format("YYYY.MM.DD")} ~{" "}
          {dayjs(post.endDate).format("YYYY.MM.DD")}
        </span>
      </div>

      <div className="flex gap-3 text-label-sm text-on-surface-variant mb-stack-md">
        {post.preferredAge && <span>선호 연령: {post.preferredAge}</span>}
        {post.preferredGender && <span>선호 성별: {post.preferredGender}</span>}
        <span>모집 인원: {post.recruitCount}명</span>
      </div>

      <div className="card-base p-stack-md mb-stack-md">
        <p className="text-body-md whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="flex items-center gap-3 mb-stack-lg flex-wrap">
        {isOwner ? (
          <>
            <Link to={`/matching/${post.id}/edit`} className="btn-ghost">
              수정
            </Link>
            <button
              onClick={() =>
                confirm("모집글을 삭제할까요?") && deleteMutation.mutate()
              }
              className="btn-ghost text-error"
            >
              삭제
            </button>
          </>
        ) : (
          !myRequest &&
          (post.status === "CLOSED" ? (
            <button disabled className="btn-primary disabled:opacity-50">
              모집 마감
            </button>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <textarea
                className="input-base h-20 resize-none"
                placeholder="간단한 소개나 인사말을 남겨보세요 (선택)"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                maxLength={200}
              />
              <button
                onClick={() => applyMutation.mutate(applyMessage)}
                disabled={applyMutation.isPending}
                className="btn-primary disabled:opacity-50 self-end"
              >
                신청하기
              </button>
            </div>
          ))
        )}

        {myRequest && (
          <div className="flex items-center gap-2">
            <span className="chip bg-surface-container text-on-surface-variant">
              신청 상태:{" "}
              {myRequest.status === "REQUESTED"
                ? "대기중"
                : myRequest.status === "ACCEPTED"
                  ? "수락됨"
                  : "거절됨"}
            </span>
            {myRequest.status !== "REJECTED" && (
              <button
                onClick={() =>
                  confirm("신청을 취소할까요?") &&
                  cancelMutation.mutate(myRequest.id)
                }
                disabled={cancelMutation.isPending}
                className="btn-ghost text-error disabled:opacity-50"
              >
                {cancelMutation.isPending ? "취소 중..." : "신청 취소"}
              </button>
            )}
          </div>
        )}
      </div>

      {isOwner && requests && requests.length > 0 && (
        <div className="mt-stack-lg">
          <h2 className="text-label-lg font-bold mb-stack-sm">
            신청자 ({requests.length})
          </h2>
          <div className="flex flex-col gap-2">
            {requests.map((req) => (
              <MateRequestItem
                key={req.id}
                request={req}
                onAccept={(requestId) =>
                  decideMutation.mutate({ requestId, decision: "ACCEPT" })
                }
                onReject={(requestId) =>
                  decideMutation.mutate({ requestId, decision: "REJECT" })
                }
                onClickRequester={(userId, label) =>
                  setProfileTarget({
                    userId,
                    label,
                    canChat: true,
                  })
                }
                isDeciding={decideMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {post.status === "CLOSED" && user != null && (
        <div className="mt-stack-lg flex flex-col gap-stack-md">
          <h2 className="text-label-lg font-bold">동행 후기</h2>

          {tripNotStarted ? (
            <p className="text-label-md text-on-surface-variant">
              여행 시작일({dayjs(post.startDate).format("YYYY.MM.DD")}) 이후에
              후기를 남길 수 있어요.
            </p>
          ) : (
            <>
              {isOwner &&
                requests
                  ?.filter((r) => r.status === "ACCEPTED")
                  .map((r) => (
                    <MateReviewSection
                      key={r.id}
                      matePostId={id}
                      targetUserId={r.requesterId}
                      targetLabel={`신청자 #${r.requesterId}`}
                      currentUserId={user.id}
                    />
                  ))}

              {!isOwner && myRequest?.status === "ACCEPTED" && (
                <MateReviewSection
                  matePostId={id}
                  targetUserId={post.userId}
                  targetLabel="작성자"
                  currentUserId={user.id}
                />
              )}
            </>
          )}
        </div>
      )}

      {profileTarget && (
        <UserProfileModal
          userId={profileTarget.userId}
          label={profileTarget.label}
          matePostId={id}
          canChat={profileTarget.canChat}
          onClose={() => setProfileTarget(null)}
        />
      )}
    </div>
  );
}
