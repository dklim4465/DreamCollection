interface Props {
  page: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex justify-center items-center gap-1 mt-stack-lg">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant disabled:opacity-30 hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={
            p === page
              ? "w-9 h-9 rounded-lg bg-primary text-on-primary font-bold text-label-md"
              : "w-9 h-9 rounded-lg text-on-surface-variant hover:bg-surface-container text-label-md"
          }
        >
          {p + 1}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant disabled:opacity-30 hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  );
}
