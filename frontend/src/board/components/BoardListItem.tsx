import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { BoardPostListItem } from "@/board/types/board";
import {
  BOARD_CATEGORY_LABELS,
  TRADE_STATUS_LABELS,
  type BoardCategory,
} from "@/board/types/board";

interface Props {
  post: BoardPostListItem;
}

export default function BoardListItem({ post }: Props) {
  const categoryLabel =
    BOARD_CATEGORY_LABELS[post.category as BoardCategory] ?? post.category;

  return (
    <Link
      to={`/community/${post.id}`}
      className="card-interactive block p-stack-md flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <span className="chip-primary">{categoryLabel}</span>
        {post.tradeStatus && (
          <span className="chip bg-surface-container text-on-surface-variant">
            {TRADE_STATUS_LABELS[post.tradeStatus] ?? post.tradeStatus}
          </span>
        )}
      </div>

      <h3 className="text-headline-sm font-bold line-clamp-1">{post.title}</h3>

      {post.price != null && (
        <p className="text-label-md font-bold text-primary">
          {post.price.toLocaleString()}원
        </p>
      )}

      <div className="flex items-center gap-4 text-outline text-label-sm mt-1">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">visibility</span>
          {post.viewCount}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">favorite</span>
          {post.likeCount}
        </span>
        <span className="ml-auto">
          {dayjs(post.createdAt).format("YYYY.MM.DD")}
        </span>
      </div>
    </Link>
  );
}
