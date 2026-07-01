import EmptyState from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';

/**
 * 여행 계획 페이지 (Pre-travel)
 * 담당: C
 * TODO: 날짜별 일정 카드 + 항공/숙소 등록 폼
 */
export default function TravelPlanPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">내 여행 계획</h1>
        <Link to="/plan/new" className="btn-primary">+ 새 계획</Link>
      </div>
      {/* TODO: PlanCard 그리드 */}
      <EmptyState
        icon="🗺️"
        title="여행 계획을 세워보세요"
        description="일정, 항공, 숙소를 한 곳에서 관리하세요"
        action={<Link to="/plan/new" className="btn-primary">계획 시작하기</Link>}
      />
    </div>
  );
}
