import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import EmptyState from "@/common/component/EmptyState";
import LoadingSpinner from "@/common/component/LoadingSpinner";
import { travelPlanApi } from "@/travelPlan/api/travelPlanApi";
import type { ScheduleStatus } from "@/types";

const STATUS_LABEL: Record<ScheduleStatus, { text: string; className: string }> = {
  DRAFT: { text: "작성중", className: "chip bg-surface-variant text-on-surface-variant" },
  PAID: { text: "결제완료", className: "chip-success" },
  CANCELLED: { text: "취소됨", className: "chip bg-error/10 text-error" },
};

/**
 * 여행 계획 목록 페이지 (Pre-travel)
 * TODO: 항공/숙소 등록 폼, AI 추천 결과 연동
 */
export default function TravelPlanPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["travelPlans", "mine"],
    queryFn: travelPlanApi.getMyPlans,
  });

  const plans = data?.data?.data ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">내 여행 계획</h1>
        <Link to="/plan/new" className="btn-primary">
          + 새 계획
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : plans.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="여행 계획을 세워보세요"
          description="일정, 항공, 숙소를 한 곳에서 관리하세요"
          action={
            <Link to="/plan/new" className="btn-primary">
              계획 시작하기
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {plans.map((plan) => {
            const status = STATUS_LABEL[plan.status];
            return (
              <Link
                key={plan.id}
                to={`/plan/${plan.id}`}
                className="card-interactive p-stack-lg flex flex-col gap-stack-sm"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-headline-sm font-bold">{plan.title}</h3>
                  <span className={status.className}>{status.text}</span>
                </div>
                <p className="text-body-md text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {plan.destination}
                </p>
                <p className="text-label-md text-on-surface-variant">
                  {dayjs(plan.startDate).format("YYYY.MM.DD")} ~{" "}
                  {dayjs(plan.endDate).format("MM.DD")} · {plan.peopleCount}명
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
