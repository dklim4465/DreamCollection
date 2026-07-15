import MediaThumbnail from "@/travelog/components/tripLogDetailPage/MediaThumbnail";
import { MediaSummaryDTO } from "@/travelog/types/tripLog";

interface MediaGridProps {
  mediaList: MediaSummaryDTO[];
  deleteMode: boolean;
  selectedMediaList: number[];
  onToggleMedia: (mno: number) => void;
}

const MediaGrid = ({
  mediaList,
  deleteMode,
  selectedMediaList,
  onToggleMedia,
}: MediaGridProps) => {
  if (mediaList.length === 0) {
    return (
      <div
        className="
          flex
          h-40
          items-center
          justify-center
          rounded-xl
          border
          border-outline-variant
          bg-surface-container
          text-body-md
          text-on-surface-variant
        "
      >
        미디어가 없습니다.
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
      "
    >
      {mediaList.map((media) => (
        <MediaThumbnail
          key={media.mno}
          media={media}
          deleteMode={deleteMode}
          selected={selectedMediaList.includes(media.mno)}
          onClick={() => onToggleMedia(media.mno)}
        />
      ))}
    </div>
  );
};

export default MediaGrid;
