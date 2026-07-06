import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import { travelPlanApi } from "@/travelPlan/api/travelPlanApi";
import { cartApi } from "@/payment/api/cartApi";

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "작성중", className: "chip bg-surface-variant text-on-surface-variant" },
  PAID: { text: "결제완료", className: "chip-success" },
  CANCELLED: { text: "취소됨", className: "chip bg-error/10 text-error" },
};

/**
 * 일정 상세 페이지
 * - 공유 링크 생성
 * - 장바구니 담기 (결제 전 단계)
 * TODO: AI 추천(항공/숙소/여행지/코스) 리스트, Day별 일정표 추가
 */
export default function TravelPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const planId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["travelPlan", planId],
    queryFn: () => travelPlanApi.getById(planId),
    enabled: !Number.isNaN(planId),
  });

  const shareMutation = useMutation({
    mutationFn: () => travelPlanApi.generateShareLink(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelPlan", planId] });
    },
  });

  const cartMutation = useMutation({
    mutationFn: () => cartApi.addItem(plan!),
    onSuccess: () => setAddedToCart(true),
  });

  if (isLoading) return <LoadingSpinner />;

  const plan = data?.data?.data;
  if (!plan) {
    return (
      <div className="text-center py-20">
        <p className="text-headline-sm font-bold mb-4">일정을 찾을 수 없어요</p>
        <Link to="/plan" className="btn-ghost">
          내 일정으로 돌아가기
        </Link>
      </div>
    );
  }

  const status = STATUS_LABEL[plan.status];

  const handleShare = async () => {
    const res = await shareMutation.mutateAsync();
    await navigator.clipboard.writeText(res.data.data.shareLink!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-stack-lg">
      <div className="flex items-start justify-between">
        <div>
          <span className={status.className}>{status.text}</span>
          <h1 className="text-headline-md font-bold mt-2">{plan.title}</h1>
        </div>
      </div>

      <div className="card-base p-stack-lg flex flex-col gap-3">
        <div className="flex items-center gap-2 text-body-md">
          <span className="material-symbols-outlined text-primary">location_on</span>
          {plan.destination}
        </div>
        <div className="flex items-center gap-2 text-body-md">
          <span className="material-symbols-outlined text-primary">date_range</span>
          {dayjs(plan.startDate).format("YYYY.MM.DD")} ~{" "}
          {dayjs(plan.endDate).format("YYYY.MM.DD")}
        </div>
        <div className="flex items-center gap-2 text-body-md">
          <span className="material-symbols-outlined text-primary">group</span>
          {plan.peopleCount}명
        </div>
        {plan.memo && (
          <div className="flex items-start gap-2 text-body-md text-on-surface-variant pt-2 border-t border-outline-variant">
            <span className="material-symbols-outlined text-base mt-0.5">notes</span>
            {plan.memo}
          </div>
        )}
      </div>

      {/* 공유하기 */}
      <div className="card-base p-stack-lg flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-headline-sm font-bold mb-1">일정 공유하기</h3>
          <p className="text-label-md text-on-surface-variant">
            메이트나 외부인에게 공유 링크를 보내보세요
          </p>
        </div>
        <button
          onClick={handleShare}
          className="btn-ghost shrink-0"
          disabled={shareMutation.isPending}
        >
          {copied ? "링크 복사됨!" : plan.shareLink ? "링크 다시 복사" : "공유 링크 만들기"}
        </button>
      </div>

      {/* 결제 전 단계: 장바구니 담기 */}
      {plan.status === "DRAFT" && (
        <div className="card-base p-stack-lg flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-headline-sm font-bold mb-1">예약 진행하기</h3>
            <p className="text-label-md text-on-surface-variant">
              장바구니에 담고 결제를 진행하세요
            </p>
          </div>
          {addedToCart ? (
            <button onClick={() => navigate("/cart")} className="btn-primary shrink-0">
              장바구니로 이동
            </button>
          ) : (
            <button
              onClick={() => cartMutation.mutate()}
              className="btn-primary shrink-0"
              disabled={cartMutation.isPending}
            >
              {cartMutation.isPending ? "담는 중..." : "장바구니 담기"}
            </button>
          )}
        </div>
      )}

      {plan.status === "PAID" && (
        <div className="card-base p-stack-lg flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-body-md font-semibold">결제가 완료된 일정이에요</span>
        </div>
      )}
    </div>
  );
}
