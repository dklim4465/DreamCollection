import { Link } from "react-router-dom";
import dayjs from "dayjs";
import type { MatePostListItem } from "@/mate/types/mate";
import {
  MATE_POST_STATUS_LABELS,
  type MatePostStatus,
} from "@/mate/types/mate";

interface Props {
  post: MatePostListItem;
}

export default function MateCard({ post }: Props) {
  const statusLabel =
    MATE_POST_STATUS_LABELS[post.status as MatePostStatus] ?? post.status;
  const isClosed = post.status === "CLOSED";

  return (
    <Link
      to={`/matching/${post.id}`}
      className="card-interactive block p-stack-md flex flex-col gap-2"
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

      <p className="text-label-sm text-on-surface-variant">{post.nickname}</p>

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
