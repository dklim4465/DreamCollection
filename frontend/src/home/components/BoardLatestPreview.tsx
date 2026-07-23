import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { boardPostApi } from "@/board/api/boardApi";

export default function BoardLatestPreview() {
  const { data, isLoading } = useQuery({
    queryKey: ["board-posts", "FREE", "latest-preview"],
    queryFn: () => boardPostApi.getList("FREE", 0, 5),
    retry: false,
  });
  const posts = data?.data?.data?.content ?? [];

  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-primary text-label-sm tracking-[0.3em] uppercase mb-1">
            Community
          </p>
          <h2 className="text-headline-sm font-bold">게시판 최신글</h2>
        </div>
        <Link
          to="/community"
          className="text-label-sm text-primary font-bold hover:underline"
        >
          전체보기
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-surface-container-low animate-pulse"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant py-4 text-center">
          등록된 게시글이 없어요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant">
          {posts.map((p) => (
            <li key={p.id} className="py-2.5">
              <Link
                to={`/community/${p.id}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <span className="text-body-sm font-semibold truncate flex-1">
                  {p.title}
                </span>
                <span className="text-label-sm text-on-surface-variant shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    visibility
                  </span>
                  {p.viewCount}
                </span>
                <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0">
                  chevron_right
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
