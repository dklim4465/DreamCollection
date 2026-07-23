import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mateRecommendApi } from "@/mate/api/mateApi";
import LoadingSpinner from "@/common/components/LoadingSpinner";
import EmptyState from "@/common/components/EmptyState";

export default function MateRecommendPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mate-recommend"],
    queryFn: () =>
      mateRecommendApi.getRecommendations().then((res) => res.data.data),
  });

  return (
    <div>
      <div className="mb-stack-lg">
        <Link to="/matching" className="text-label-md text-on-surface-variant">
          ← 여행 동행 찾기로 돌아가기
        </Link>
        <h1 className="text-headline-md font-bold mt-2">AI 추천 동행</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          내 여행 성향에 맞는 모집글을 AI가 골라봤어요
        </p>
      </div>

      {isLoading && <LoadingSpinner message="추천 받는 중..." />}

      {isError && (
        <EmptyState
          icon="⚠️"
          title="추천을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요."
        />
      )}

      {!isLoading && data && data.length === 0 && (
        <EmptyState
          icon="🤖"
          title="추천할 모집글이 없어요"
          description="모집 중인 동행이 더 생기면 추천해드릴게요."
        />
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <Link
              key={item.postId}
              to={`/matching/${item.postId}`}
              className="card-interactive p-stack-md flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-headline-sm font-bold">
                  {item.destination}
                </h3>
                {item.travelStyle && (
                  <span className="chip bg-surface-container text-on-surface-variant">
                    {item.travelStyle}
                  </span>
                )}
              </div>
              <p className="text-label-md text-on-surface-variant">
                {item.reason}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
