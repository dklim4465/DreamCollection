// src/board/components/BoardListItem.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { BoardPostListItem } from "@/board/types/board";
import {
  BOARD_CATEGORY_LABELS,
  TRADE_STATUS_LABELS,
  type BoardCategory,
} from "@/board/types/board";
import { getBadgeFallbackIcon } from "@/board/utils/badgeIcon";

interface Props {
  post: BoardPostListItem;
}

export default function BoardListItem({ post }: Props) {
  const [badgeImageFailed, setBadgeImageFailed] = useState(false);

  const categoryLabel =
    BOARD_CATEGORY_LABELS[post.category as BoardCategory] ?? post.category;
  const showBadgeImage = Boolean(post.badgeIconUrl) && !badgeImageFailed;
  const badgeFallbackIcon = getBadgeFallbackIcon(post.badgeConditionType);

  return (
    <Link
      to={`/community/${post.id}`}
      className="card-interactive p-stack-md flex flex-col gap-2"
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

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
          {post.profileImageUrl ? (
            <img
              src={post.profileImageUrl}
              alt={post.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-primary text-xs">
              person
            </span>
          )}
        </div>
        <p className="text-label-sm text-on-surface-variant">{post.nickname}</p>
        <span className="chip bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5">
          Lv.{post.level}
        </span>
        {post.badgeName && (
          <span
            className="flex items-center gap-0.5 shrink-0"
            title={post.badgeName}
          >
            {showBadgeImage ? (
              <img
                src={post.badgeIconUrl!}
                alt={post.badgeName}
                className="w-4 h-4 object-contain"
                onError={() => setBadgeImageFailed(true)}
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-sm">
                {badgeFallbackIcon}
              </span>
            )}
          </span>
        )}
      </div>

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
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          {post.commentCount}
        </span>
        <span className="ml-auto">
          {dayjs(post.createdAt).format("YYYY.MM.DD")}
        </span>
      </div>
    </Link>
  );
}
