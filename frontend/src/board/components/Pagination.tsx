interface Props {
  page: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
  /** true면 페이지가 1개여도 버튼 표시 (기본 false) */
  alwaysShow?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  alwaysShow = false,
}: Props) {
  const pagesCount = Math.max(1, totalPages);
  if (!alwaysShow && pagesCount <= 1) return null;

  const pages = Array.from({ length: pagesCount }, (_, i) => i);

  const inactiveBtn =
    "w-9 h-9 rounded-lg border border-outline-variant/70 bg-surface-container-lowest text-on-surface flex items-center justify-center text-label-md hover:bg-surface-container disabled:opacity-30";
  const activeBtn =
    "w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-label-md flex items-center justify-center";

  return (
    <div className="mt-stack-md flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 0}
        className={inactiveBtn}
        aria-label="이전 페이지"
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={p === page ? activeBtn : inactiveBtn}
          aria-current={p === page ? "page" : undefined}
        >
          {p + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pagesCount - 1}
        className={inactiveBtn}
        aria-label="다음 페이지"
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  );
}
