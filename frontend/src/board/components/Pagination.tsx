interface Props {
  page: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
  /** true면 페이지가 1개여도 버튼 표시 (기본 false) */
  alwaysShow?: boolean;
}

const PAGES_PER_GROUP = 10;

export default function Pagination({
  page,
  totalPages,
  onChange,
  alwaysShow = false,
}: Props) {
  const pagesCount = Math.max(1, totalPages);
  if (!alwaysShow && pagesCount <= 1) return null;

  const groupStart = Math.floor(page / PAGES_PER_GROUP) * PAGES_PER_GROUP;
  const groupEnd = Math.min(groupStart + PAGES_PER_GROUP, pagesCount);
  const pages = Array.from(
    { length: groupEnd - groupStart },
    (_, i) => groupStart + i,
  );

  const hasPrevGroup = groupStart > 0;
  const hasNextGroup = groupEnd < pagesCount;

  return (
    <div className="mt-stack-md flex items-center justify-center gap-3 text-label-lg">
      {hasPrevGroup && (
        <button
          type="button"
          onClick={() => onChange(groupStart - 1)}
          className="flex items-center gap-0.5 text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-base">
            chevron_left
          </span>
          이전
        </button>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={
            p === page
              ? "font-bold text-primary underline underline-offset-4"
              : "text-primary hover:underline"
          }
        >
          {p + 1}
        </button>
      ))}

      {hasNextGroup && (
        <button
          type="button"
          onClick={() => onChange(groupEnd)}
          className="flex items-center gap-0.5 text-primary hover:underline"
        >
          다음
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
        </button>
      )}
    </div>
  );
}
