// src/mate/components/MateCard.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { MatePostListItem } from "@/mate/types/mate";
import {
  MATE_POST_STATUS_LABELS,
  type MatePostStatus,
} from "@/mate/types/mate";
import { getBadgeFallbackIcon } from "@/mate/utils/badgeIcon";

interface Props {
  post: MatePostListItem;
}

export default function MateCard({ post }: Props) {
  const [badgeImageFailed, setBadgeImageFailed] = useState(false);

  const statusLabel =
    MATE_POST_STATUS_LABELS[post.status as MatePostStatus] ?? post.status;
  const isClosed = post.status === "CLOSED";
  const showBadgeImage = Boolean(post.badgeIconUrl) && !badgeImageFailed;
  const badgeFallbackIcon = getBadgeFallbackIcon(post.badgeConditionType);

  return (
    <Link
      to={`/matching/${post.id}`}
      className="card-interactive p-stack-md flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <span
          className={
            isClosed
              ? "chip bg-surface-container text-on-surface-variant"
              : "chip-primary"
          }
        >
          {statusLabel}
        </span>
        {post.travelStyle && (
          <span className="chip bg-surface-container text-on-surface-variant">
            {post.travelStyle}
          </span>
        )}
      </div>

      <h3 className="text-headline-sm font-bold line-clamp-1">
        {post.destination}
      </h3>

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

      <p className="text-label-md text-on-surface-variant">
        {dayjs(post.startDate).format("YYYY.MM.DD")} ~{" "}
        {dayjs(post.endDate).format("YYYY.MM.DD")}
      </p>

      <div className="flex items-center gap-4 text-outline text-label-sm mt-1">
        {post.preferredAge && <span>{post.preferredAge}</span>}
        {post.preferredGender && <span>{post.preferredGender}</span>}
        <span className="ml-auto">모집 {post.recruitCount}명</span>
      </div>
    </Link>
  );
}
