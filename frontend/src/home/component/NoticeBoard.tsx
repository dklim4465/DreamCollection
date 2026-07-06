import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { noticeApi } from "@/home/api/noticeApi";

/**
 * 관리자 페이지에서 등록한 공지사항을 실제로 보여주는 곳.
 * 클릭하면 아코디언처럼 펼쳐서 내용을 보여준다 (별도 상세 페이지 없이 홈에서 바로 확인).
 */
export default function NoticeBoard() {
  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: noticeApi.getNotices,
    retry: false,
  });
  const notices = data?.data?.data ?? [];
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="card-base p-stack-lg flex flex-col gap-stack-md">
      <h2 className="text-headline-sm font-bold">공지사항</h2>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant py-4 text-center">등록된 공지사항이 없어요.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant">
          {notices.map((n) => {
            const open = openId === n.id;
            return (
              <li key={n.id} className="py-2">
                <button
                  className="w-full flex items-center gap-2 text-left"
                  onClick={() => setOpenId(open ? null : n.id)}
                >
                  {n.pinned && <span className="chip-tertiary text-[10px] shrink-0">고정</span>}
                  <span className="text-body-sm font-semibold truncate flex-1">{n.title}</span>
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
  );
}
