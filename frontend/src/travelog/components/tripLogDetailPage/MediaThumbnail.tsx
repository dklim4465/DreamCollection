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
        transition
        ${selected ? "ring-2 ring-primary" : "hover:scale-[1.02]"}
      `}
    >
      {deleteMode && (
        <div className="absolute left-2 top-2 z-10">
          <input
            type="checkbox"
            checked={selected}
            readOnly
            className="
              h-5
              w-5
              accent-primary
            "
          />
        </div>
      )}

      {selected && (
        <div
          className="
            absolute
            inset-0
            z-[5]
            bg-primary/30
          "
        />
      )}

      <img
        src={`http://localhost:8080/${media.mediaPath}/thumbnail/${media.storedFileName}`}
        alt=""
        draggable={false}
        className="
          h-full
          w-full
          object-cover
          transition
          group-hover:scale-105
        "
      />
    </div>
  );
};

export default MediaThumbnail;
