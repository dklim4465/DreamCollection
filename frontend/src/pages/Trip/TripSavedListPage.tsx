import { Link } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";

export default function TripSavedListPage() {
  // TODO: GET /trip/saved API 연동 후 목록 렌더
  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">내 일정</h1>
        <Link to="/trip/new" className="btn-primary text-sm">
          + 새 일정
        </Link>
      </div>

      <EmptyState
        icon="📅"
        title="저장된 일정이 없어요"
        description="AI에게 새 일정을 추천받아보세요"
        action={
          <Link to="/trip/new" className="btn-primary">
            일정 만들기
          </Link>
        }
      />
    </div>
  );
}
