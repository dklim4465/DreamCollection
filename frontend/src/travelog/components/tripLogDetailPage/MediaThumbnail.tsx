import { MediaSummaryDTO } from "@/travelog/types/tripLog";
import { getMediaThumbnailUrl } from "@/travelog/utils/media";
import { Check } from "lucide-react";

interface MediaThumbnailProps {
  media: MediaSummaryDTO;
  size?: string;
  deleteMode?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const MediaThumbnail = ({
  media,
  size = "aspect-square",
  deleteMode = false,
  selected = false,
  onClick,
}: MediaThumbnailProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        group
        relative
        overflow-hidden
        rounded-lg
        bg-surface-container
        ${size}
        ${onClick ? "cursor-pointer" : ""}
        ${selected ? "ring-2 ring-primary shadow-lg" : "hover:scale-[1.02]"}
      `}
    >
      <img
        src={getMediaThumbnailUrl(media)}
        alt=""
        draggable={false}
        className="
          h-full
          w-full
          object-cover
          transition-transform
          duration-200
          group-hover:scale-105
        "
      />

      {deleteMode && selected && (
        <div
          className={`
            absolute
            right-2
            top-2
            z-20
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            border-2
            transition-all
            ${
              selected
                ? "border-primary bg-primary text-white"
                : "border-white bg-black/40 text-transparent"
            }
          `}
        >
          <Check size={14} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};

export default MediaThumbnail;
