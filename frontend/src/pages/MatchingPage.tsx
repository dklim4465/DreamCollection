import EmptyState from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';

/**
 * 동행 탐색 페이지
 * 담당: B
 * TODO: 동행 모집 카드 그리드 + 스타일 필터
 */
export default function MatchingPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <div>
          <h1 className="text-headline-md font-bold">여행 동행 찾기</h1>
          <p className="text-body-md text-on-surface-variant mt-1">비슷한 스타일의 여행 친구를 만나보세요</p>
        </div>
        <Link to="/matching/new" className="btn-primary">+ 동행 구하기</Link>
      </div>
      {/* TODO: MatchingFilterBar, MatchingCardGrid */}
      <EmptyState
        icon="👥"
        title="모집 중인 동행이 없어요"
        description="첫 번째 동행 모집을 시작해보세요!"
        action={<Link to="/matching/new" className="btn-primary">동행 구하기</Link>}
      />
    </div>
  );
}
