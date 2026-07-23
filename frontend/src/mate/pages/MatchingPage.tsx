import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { matePostApi } from "@/mate/api/mateApi";
import { type MatePostStatus } from "@/mate/types/mate";
import MateCard from "@/mate/components/MateCard";
import MateStatusTabs from "@/mate/components/MateStatusTabs";
import Pagination from "@/board/components/Pagination";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import EmptyState from "@/common/components/EmptyState";

export default function MatchingPage() {
  const [status, setStatus] = useState<MatePostStatus>("RECRUITING");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["mate-posts", status, page],
    queryFn: () =>
      matePostApi.getList(status, page).then((res) => res.data.data),
  });

  const handleStatusChange = (next: MatePostStatus) => {
    setStatus(next);
    setPage(0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <div>
          <h1 className="text-headline-md font-bold">여행 동행 찾기</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            비슷한 스타일의 여행 친구를 만나보세요
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/matching/recommend"
            className="btn-primary inline-flex items-center justify-center gap-1"
          >
            <span className="leading-none">🤖</span> AI 추천
          </Link>
          <Link
            to="/matching/new"
            className="btn-primary inline-flex items-center justify-center"
          >
            + 동행 구하기
          </Link>
        </div>
      </div>

      <MateStatusTabs value={status} onChange={handleStatusChange} />

      {isLoading && <LoadingSpinner message="불러오는 중..." />}

      {!isLoading && data && data.content.length === 0 && (
        <EmptyState
          icon="👥"
          title="모집 중인 동행이 없어요"
          description="첫 번째 동행 모집을 시작해보세요!"
          action={
            <Link to="/matching/new" className="btn-primary">
              동행 구하기
            </Link>
          }
        />
      )}

      {!isLoading && data && data.content.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-stack-md">
            {data.content.map((post) => (
              <MateCard key={post.id} post={post} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
