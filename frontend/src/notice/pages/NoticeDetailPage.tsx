import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { noticeApi } from "@/home/api/noticeApi";
import { couponApi } from "@/profile/api/couponApi";
import { useAuthStore } from "@/auth/store/authStore";

/** 이 문구가 제목에 들어간 공지는 "쿠폰받기" 버튼이 붙는 이벤트 공지로 취급한다. */
function isCouponNotice(title: string) {
  return title.includes("쿠폰");
}

export default function NoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showClaimedPopup, setShowClaimedPopup] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notice", noticeId],
    queryFn: () => noticeApi.getNoticeDetail(noticeId!),
    enabled: !!noticeId,
    retry: false,
  });

  const claimMutation = useMutation({
    mutationFn: () => couponApi.claimEventCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons", "me"] });
      setShowClaimedPopup(true);
    },
  });

  const notice = data?.data?.data;

  const handleClaimClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    claimMutation.mutate();
  };

  if (isLoading) {
    return <div className="max-w-3xl mx-auto h-40 rounded-2xl bg-surface-container-low animate-pulse" />;
  }

  if (isError || !notice) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-body-md text-on-surface-variant mb-stack-md">
          공지사항을 찾을 수 없어요.
        </p>
        <Link to="/notices" className="btn-primary">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/notices"
        className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface mb-stack-md"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        목록으로
      </Link>

      <div className="card-base p-stack-lg">
        <div className="flex items-center gap-2 mb-2">
          {notice.pinned && <span className="chip-tertiary text-[10px]">고정</span>}
          <h1 className="text-headline-md font-bold">{notice.title}</h1>
        </div>
        <p className="text-label-sm text-on-surface-variant mb-stack-md">
          {dayjs(notice.createdAt).format("YYYY.MM.DD")} · 조회 {notice.viewCount}
        </p>

        <p className="text-body-md whitespace-pre-line leading-relaxed">{notice.content}</p>

        {isCouponNotice(notice.title) && (
          <div className="mt-stack-lg pt-stack-md border-t border-outline-variant">
            <button
              type="button"
              onClick={handleClaimClick}
              disabled={claimMutation.isPending}
              className="btn-primary w-full sm:w-auto"
            >
              {claimMutation.isPending ? "쿠폰 받는 중..." : "쿠폰받기"}
            </button>
            {!isAuthenticated && (
              <p className="text-label-sm text-on-surface-variant mt-2">
                로그인하시면 쿠폰을 받을 수 있어요.
              </p>
            )}
            {claimMutation.isError && (
              <p className="text-label-sm text-error mt-2">
                쿠폰 지급 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.
              </p>
            )}
          </div>
        )}
      </div>

      {showClaimedPopup && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-4">
          <div className="bg-surface-container-lowest rounded-3xl p-stack-lg max-w-sm w-full text-center traveler-glow">
            <span className="material-symbols-outlined text-5xl text-primary mb-stack-sm">
              confirmation_number
            </span>
            <p className="text-headline-sm font-bold mb-2">
              10%, 5% 쿠폰이 발급되었습니다
            </p>
            <p className="text-body-md text-on-surface-variant mb-stack-lg">
              보관함을 확인하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowClaimedPopup(false)}
                className="btn-ghost flex-1"
              >
                닫기
              </button>
              <Link
                to="/profile?tab=coupons"
                onClick={() => setShowClaimedPopup(false)}
                className="btn-primary flex-1"
              >
                보관함 가기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
