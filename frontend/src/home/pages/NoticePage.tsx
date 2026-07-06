import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { noticeApi } from "@/home/api/noticeApi";

/**
 * 공지사항 전체 목록 페이지.
 * 바로가기 바의 "공지사항" 클릭 시 이동하는 별도 페이지.
 */
export default function NoticePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: noticeApi.getNotices,
    retry: false,
  });
  const notices = data?.data?.data ?? [];
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-stack-lg">
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
          aria-label="홈으로"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-headline-md font-bold">공지사항</h1>
      </div>

      <section className="card-base p-stack-lg flex flex-col gap-stack-md">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant py-8 text-center">
            등록된 공지사항이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant">
            {notices.map((n) => {
              const open = openId === n.id;
              return (
                <li key={n.id} className="py-3">
                  <button
                    className="w-full flex items-center gap-2 text-left"
                    onClick={() => setOpenId(open ? null : n.id)}
                  >
                    {n.pinned && <span className="chip-tertiary text-[10px] shrink-0">고정</span>}
                    <span className="text-body-md font-semibold truncate flex-1">{n.title}</span>
                    <span className="material-symbols-outlined text-lg text-on-surface-variant shrink-0">
                      {open ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {open && (
                    <p className="text-body-sm text-on-surface-variant mt-2 whitespace-pre-line">
                      {n.content}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
