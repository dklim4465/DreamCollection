import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { boardPostApi } from "@/api/board";
import { useAuthStore } from "@/store/authStore";
import CategoryTabs from "@/components/board/CategoryTabs";
import BoardListItem from "@/components/board/BoardListItem";
import Pagination from "@/components/board/Pagination";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

/**
 * 게시판 페이지
 * 백엔드 GET /api/board/posts?category=&page=&size= 연동
 * 참고: 백엔드가 category 파라미터를 필수로 받기 때문에 "전체보기" 탭은 없음 (기본 자유 게시판부터 시작)
 */
export default function CommunityPage() {
  const { isAuthenticated } = useAuthStore();
  const [category, setCategory] = useState("FREE");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["board-posts", category, page],
    queryFn: () =>
      boardPostApi.getList(category, page, 10).then((res) => res.data.data),
  });

  const handleCategoryChange = (next) => {
    setCategory(next);
    setPage(0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-stack-lg">
        <h1 className="text-headline-md font-bold">여행자 게시판</h1>
        {isAuthenticated && (
          <Link to="/community/new" className="btn-primary">
            + 글 쓰기
          </Link>
        )}
      </div>

      <CategoryTabs value={category} onChange={handleCategoryChange} />

      {isLoading && <LoadingSpinner message="게시글을 불러오는 중..." />}

      {isError && (
        <EmptyState
          icon="⚠️"
          title="게시글을 불러오지 못했어요"
          description="잠시 후 다시 시도해주세요."
        />
      )}

      {!isLoading && !isError && data && data.content.length === 0 && (
        <EmptyState
          icon="✍️"
          title="아직 게시글이 없어요"
          description="첫 번째 여행 이야기를 공유해보세요!"
          action={
            isAuthenticated ? (
              <Link to="/community/new" className="btn-primary">
                글 쓰기
              </Link>
            ) : undefined
          }
        />
      )}

      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {data.content.map((post) => (
              <BoardListItem key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            page={data.number}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
