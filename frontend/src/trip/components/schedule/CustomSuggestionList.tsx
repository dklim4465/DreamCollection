import { useState, type FormEvent } from "react";
import type { RecommendationCard } from "./types";

interface Props {
  onDragEnd: () => void;
}

const parseUrl = (value: string) => {
  const trimmed = value.trim();
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    (!/\s/.test(trimmed) && trimmed.includes("."));

  if (!looksLikeUrl) return null;

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
};

export default function CustomSuggestionList({ onDragEnd }: Props) {
  const [input, setInput] = useState("");
  const [cards, setCards] = useState<RecommendationCard[]>([]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = input.trim();
    if (!value) return;

    const url = parseUrl(value);

    setCards((previous) => [
      {
        id: `custom-${Date.now()}`,
        itemType: "Activity",
        badge: url ? "URL 추가" : "직접 추가",
        title: url ? url.hostname.replace(/^www\./, "") : value,
        description: url ? value : "직접 추가한 일정입니다.",
        sourceUrl: url ? value : undefined,
      },
      ...previous,
    ]);
    setInput("");
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="border-b border-outline-variant/50 bg-surface-container-low px-stack-sm py-stack-sm"
      >
        <label className="block text-label-sm font-bold text-on-surface-variant">
          직접 추가
        </label>
        <div className="mt-2 flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="장소명 또는 URL"
            className="min-w-0 flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2"
          />
          <button
            type="submit"
            className="btn-primary h-10 w-10 p-0"
            aria-label="직접 추가"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </form>

      <div className="divide-y divide-outline-variant/50 px-stack-sm">
        {cards.length === 0 ? (
          <p className="my-stack-sm border border-dashed border-outline-variant px-3 py-3 text-label-sm">
            직접 추가한 일정이 없습니다.
          </p>
        ) : (
          cards.map((card) => (
            <article
              key={card.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({ type: "recommendation", card }),
                );
                event.dataTransfer.setDragImage(event.currentTarget, 24, 24);
              }}
              onDragEnd={onDragEnd}
              className="cursor-grab px-1 py-stack-sm hover:bg-surface-container-low"
            >
              <span className="text-label-sm font-bold text-tertiary">
                {card.badge}
              </span>
              <h4 className="truncate text-label-md font-bold">{card.title}</h4>
              <p className="line-clamp-1 text-label-sm text-on-surface-variant">
                {card.description}
              </p>
            </article>
          ))
        )}
      </div>
    </>
  );
}
