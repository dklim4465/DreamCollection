import { MediaSummaryDTO } from "@/travelog/types/tripLog";

interface MediaThumbnailProps {
  media: MediaSummaryDTO;
  deleteMode: boolean;
  selected: boolean;
  onClick: () => void;
}

const MediaThumbnail = ({
  media,
  deleteMode,
  selected,
  onClick,
}: MediaThumbnailProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        group
        relative
        aspect-square
        cursor-pointer
        overflow-hidden
        rounded-xl
        bg-surface-container
        transition-all
        ${selected ? "ring-2 ring-primary shadow-lg" : "hover:scale-[1.02] hover:shabow-md"}
      `}
    >
      {deleteMode && (
        <div className="absolute left-2 top-2 z-10">
          <input
            type="checkbox"
            checked={selected}
            readOnly
            className="h-5 w-5 accent-primary"
          />
        </div>
      )}

      {selected && <div className="absolute inset-0 z-10 bg-primary/25" />}

      <img
        src={`http://localhost:8080/${media.mediaPath}/thumbnail/${media.storedFileName}`}
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
    </div>
  );
};

export default MediaThumbnail;
