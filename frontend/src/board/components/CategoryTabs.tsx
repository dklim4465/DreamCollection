import {
  BOARD_CATEGORIES,
  BOARD_CATEGORY_LABELS,
  type BoardCategory,
} from "@/board/types/board";

interface Props {
  value: BoardCategory;
  onChange: (category: BoardCategory) => void;
}

export default function CategoryTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-stack-md">
      {BOARD_CATEGORIES.map((category) => {
        const active = category === value;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={
              active
                ? "chip-primary"
                : "chip bg-surface-container text-on-surface-variant"
            }
          >
            {BOARD_CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </div>
  );
}
