import { useEffect, useState } from "react";

interface Props {
  candidates: string[];
  className?: string;
  iconClassName?: string;
}

/**
 * Place/스케줄 이미지 후보를 앞에서부터 시도.
 * Serp 썸네일이 깨지면 다음 URL, 전부 실패하면 아이콘.
 */
export default function TripThumbnail({
  candidates,
  className = "h-full w-full object-cover",
  iconClassName = "text-[32px]",
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates.join("|")]);

  const src = candidates[index];

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
        <span className={`material-symbols-outlined ${iconClassName}`}>
          flight_takeoff
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setIndex((prev) => prev + 1)}
    />
  );
}
