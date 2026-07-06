import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { noticeApi } from "@/home/api/noticeApi";

/**
 * 홈 화면 하단, 환율 위젯 옆자리에 놓이는 공지사항 미리보기.
 * 최신(고정글 우선) 3개만 보여주고, 전체 목록은 /notices 페이지로 유도.
 */
export default function NoticePreview() {
  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: noticeApi.getNotices,
    retry: false,
  });
  const notices = (data?.data?.data ?? []).slice(0, 3);

  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm font-bold">공지사항</h2>
        <Link
          to="/notices"
          className="text-label-sm text-primary font-bold hover:underline"
        >
          전체보기
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant py-4 text-center">
          등록된 공지사항이 없어요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant">
          {notices.map((n) => (
            <li key={n.id} className="py-2.5">
              <Link
                to="/notices"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                {n.pinned && <span className="chip-tertiary text-[10px] shrink-0">고정</span>}
                <span className="text-body-sm font-semibold truncate flex-1">{n.title}</span>
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
