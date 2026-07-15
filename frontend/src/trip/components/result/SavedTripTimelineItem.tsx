export interface TimelineItem {
  id: string;
  timeLabel: string;
  title: string;
  category: string;
  categoryClassName: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  icon: string;
  details?: Array<{
    label: string;
    value: string;
  }>;
}

interface Props {
  item: TimelineItem;
  expanded: boolean;
  onToggle: () => void;
}

export default function SavedTripTimelineItem({
  item,
  expanded,
  onToggle,
}: Props) {
  return (
    <article className="border-b border-outline-variant/50 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="grid w-full grid-cols-[72px_80px_minmax(0,1fr)_32px] items-center gap-stack-md px-stack-md py-stack-sm text-left transition-colors hover:bg-surface-container-low"
      >
        <span className="text-body-md font-bold text-on-surface">
          {item.timeLabel}
        </span>

        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-16 w-20 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-16 w-20 items-center justify-center rounded-md bg-surface-container text-on-surface-variant">
            <span className="material-symbols-outlined text-[27px]">
              {item.icon}
            </span>
          </span>
        )}

        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <strong className="truncate text-body-md text-on-surface">
              {item.title}
            </strong>
            <span
              className={`rounded-sm px-2 py-1 text-label-sm font-bold ${item.categoryClassName}`}
            >
              {item.category}
            </span>
          </span>

          <span className="mt-1 block truncate text-label-md text-on-surface-variant">
            {item.address ?? item.description ?? "상세 정보를 확인해보세요."}
          </span>
        </span>

        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="border-t border-outline-variant/40 bg-surface-container-low px-[184px] py-stack-md">
          {item.description && (
            <p className="text-label-md text-on-surface-variant">
              {item.description}
            </p>
          )}

          {item.details && item.details.length > 0 && (
            <dl className="mt-stack-sm grid gap-2">
              {item.details.map((detail) => (
                <div
                  key={`${item.id}-${detail.label}`}
                  className="grid grid-cols-[88px_minmax(0,1fr)] gap-3"
                >
                  <dt className="text-label-sm font-bold text-on-surface-variant">
                    {detail.label}
                  </dt>
                  <dd className="text-label-md text-on-surface">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </article>
  );
}
