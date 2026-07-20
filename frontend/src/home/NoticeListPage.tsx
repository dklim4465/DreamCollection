import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { noticeApi } from "@/home/api/noticeApi";

/**
 * 공지사항 전체 목록 (/notices)
 * 작성/수정/삭제는 관리자 전용 화면(AdminNoticesPage)에서만 가능하고,
 * 이 페이지는 회원/비회원 누구나 조회만 가능하다.
 */
export default function NoticeListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: noticeApi.getNotices,
    retry: false,
  });

  const notices = data?.data?.data ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-headline-md font-bold mb-stack-lg">공지사항</h1>

      <div className="card-base p-stack-lg">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <p className="text-body-md text-on-surface-variant py-8 text-center">
            등록된 공지사항이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant">
            {notices.map((n) => (
              <li key={n.id}>
                <Link
                  to={`/notices/${n.id}`}
                  className="flex items-center gap-stack-sm py-stack-sm hover:text-primary transition-colors"
                >
                  {n.pinned && <span className="chip-tertiary text-[10px] shrink-0">고정</span>}
                  <span className="text-body-md font-semibold truncate flex-1">{n.title}</span>
                  <span className="text-label-sm text-on-surface-variant shrink-0">
                    {dayjs(n.createdAt).format("YYYY.MM.DD")}
                  </span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0">
                    chevron_right
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
