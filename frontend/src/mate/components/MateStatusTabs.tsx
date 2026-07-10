import {
  MATE_POST_STATUSES,
  MATE_POST_STATUS_LABELS,
  type MatePostStatus,
} from "@/mate/types/mate";

interface Props {
  value: MatePostStatus;
  onChange: (status: MatePostStatus) => void;
}

export default function MateStatusTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-stack-md">
      {MATE_POST_STATUSES.map((status) => {
        const active = status === value;
        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={
              active
                ? "chip-primary"
                : "chip bg-surface-container text-on-surface-variant"
            }
          >
            {MATE_POST_STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}
