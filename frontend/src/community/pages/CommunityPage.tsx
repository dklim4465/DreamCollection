import EmptyState from '@/common/component/EmptyState';
import { Link } from 'react-router-dom';

/**
 * 커뮤니티 페이지
 * 담당: B
 * TODO: 커뮤니티 피드 목록 + 필터 + 검색
 */
export default function CommunityPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">여행자 커뮤니티</h1>
        <Link to="/community/new" className="btn-primary">+ 글 쓰기</Link>
      </div>
      {/* TODO: 게시글 목록 컴포넌트 */}
      <EmptyState
        icon="✍️"
        title="아직 게시글이 없어요"
        description="첫 번째 여행 이야기를 공유해보세요!"
        action={<Link to="/community/new" className="btn-primary">글 쓰기</Link>}
      />
    </div>
  );
}
