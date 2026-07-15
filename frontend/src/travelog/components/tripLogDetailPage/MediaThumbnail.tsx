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
      className={`media-thumbnail ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      {deleteMode && (
        <div className="media-checkbox">
          <input type="checkbox" checked={selected} readOnly />
        </div>
      )}

      <img
        src={`http://localhost:8080/${media.mediaPath}/thumbnail/${media.storedFileName}`}
        alt=""
        draggable={false}
      />
    </div>
  );
};

export default MediaThumbnail;
