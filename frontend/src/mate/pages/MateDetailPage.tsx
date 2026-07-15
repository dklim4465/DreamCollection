import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matePostApi, mateRequestApi } from "@/mate/api/mate";
import {
  MATE_POST_STATUS_LABELS,
  type MatePostStatus,
} from "@/mate/types/mate";
import { useAuthStore } from "@/auth/store/authStore";
import { chatApi } from "@/chat/api/chatApi";
import { useChatStore } from "@/chat/store/chatStore";
import MateRequestItem from "@/mate/components/MateRequestItem";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import EmptyState from "@/common/component/EmptyState";

export default function MateDetailPage() {
  const { matePostId } = useParams<{ matePostId: string }>();
  const id = Number(matePostId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { openRoom, toggleWidget, setRooms } = useChatStore();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mate-post", matePostId],
    queryFn: () => matePostApi.getDetail(id).then((res) => res.data.data),
  });

  // 작성자만 신청자 목록을 볼 수 있음
  const isOwner = user != null && post != null && user.id === post.userId;

  const { data: requests } = useQuery({
    queryKey: ["mate-requests", matePostId],
    queryFn: () => mateRequestApi.getList(id).then((res) => res.data.data),
    enabled: isOwner,
  });

  // 내가 이 모집글에 신청한 이력이 있는지 (신청 여부/수락 여부 판단용)
  const { data: myRequests } = useQuery({
    queryKey: ["mate-my-requests"],
    queryFn: () => mateRequestApi.getMyRequests().then((res) => res.data.data),
    enabled: !isOwner && user != null,
  });
  const myRequest = myRequests?.find((r) => r.matePostId === id);

  const applyMutation = useMutation({
    mutationFn: () => mateRequestApi.apply(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mate-my-requests"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "신청에 실패했어요.");
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

  // 채팅방 열기 버튼: 이 모집글 기준 채팅방을 열고(없으면 생성), 채팅 위젯을 띄운다.
  const handleOpenChat = async () => {
    const res = await chatApi.openRoom(id);
    const roomId = res.data.data;

    // 새로 열린 방을 위젯의 방 목록에도 반영해서, 목록 화면 없이 바로 대화창으로 진입
    const roomsRes = await chatApi.getMyRooms();
    setRooms(roomsRes.data.data);
    openRoom(roomId);
    toggleWidget();
  };

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

  // 채팅 버튼을 보여줄 조건: 작성자 본인이거나, 신청이 ACCEPTED된 신청자인 경우
  const canChat = isOwner || myRequest?.status === "ACCEPTED";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-stack-sm">
        <span className="chip-primary">{statusLabel}</span>
        {post.travelStyle && (
          <span className="chip bg-surface-container text-on-surface-variant">
            {post.travelStyle}
          </span>
        )}
      </div>

      <h1 className="text-headline-md font-bold mb-2">{post.destination}</h1>

      <p className="text-label-sm text-outline mb-stack-md">
        작성자 #{post.userId} · {dayjs(post.startDate).format("YYYY.MM.DD")} ~{" "}
        {dayjs(post.endDate).format("YYYY.MM.DD")}
      </p>

      <div className="flex gap-3 text-label-sm text-on-surface-variant mb-stack-md">
        {post.preferredAge && <span>선호 연령: {post.preferredAge}</span>}
        {post.preferredGender && <span>선호 성별: {post.preferredGender}</span>}
        <span>모집 인원: {post.recruitCount}명</span>
      </div>

      <div className="card-base p-stack-md mb-stack-md">
        <p className="text-body-md whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="flex items-center gap-3 mb-stack-lg">
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
          !myRequest && (
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending || post.status === "CLOSED"}
              className="btn-primary disabled:opacity-50"
            >
              {post.status === "CLOSED" ? "모집 마감" : "신청하기"}
            </button>
          )
        )}

        {myRequest && (
          <span className="chip bg-surface-container text-on-surface-variant">
            신청 상태:{" "}
            {myRequest.status === "REQUESTED"
              ? "대기중"
              : myRequest.status === "ACCEPTED"
                ? "수락됨"
                : "거절됨"}
          </span>
        )}

        {/* 채팅하기 버튼 — 작성자 본인이거나, 수락된 신청자만 보임 */}
        {canChat && (
          <button
            onClick={handleOpenChat}
            className="btn-ghost flex items-center gap-1 ml-auto"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            채팅하기
          </button>
        )}
      </div>

      {/* 작성자 전용: 신청자 목록 */}
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
                isDeciding={decideMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
