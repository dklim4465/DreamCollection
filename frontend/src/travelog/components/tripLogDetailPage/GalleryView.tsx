import { deleteMedia } from "@/travelog/api/mediaApi";
import MediaGrid from "@/travelog/components/tripLogDetailPage/MediaGrid";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { refreshTripLogOverview } from "@/travelog/utils/refreshTripLogOverview";
import { useState } from "react";
import { useParams } from "react-router-dom";

const GalleryView = () => {
  const closeGallery = useSidebarStore((state) => state.closeGallery);
  const gallerySpotId = useSidebarStore((state) => state.gallerySpotId);

  const spot = useSpotStore((state) =>
    state.spots.find((s) => s.sno === gallerySpotId),
  );

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMediaList, setSelectedMediaList] = useState<number[]>([]);

  const toggleMedia = (mno: number) => {
    setSelectedMediaList((prev) =>
      prev.includes(mno) ? prev.filter((id) => id !== mno) : [...prev, mno],
    );
  };

  const handleCancelDelete = () => {
    setDeleteMode(false);
    setSelectedMediaList([]);
  };

  const { tno } = useParams();

  const handleDelete = async () => {
    if (selectedMediaList.length === 0) return;

    try {
      await deleteMedia(selectedMediaList);

      await refreshTripLogOverview(Number(tno));

      setSelectedMediaList([]);
      setDeleteMode(false);

      closeGallery();
    } catch (error) {
      console.error(error);
      alert("미디어 삭제에 실패했습니다.");
    }
  };

  if (!spot) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={closeGallery}
          className="
            text-label-md
            text-on-surface-variant
            transition-colors
            hover:text-on-surface
          "
        >
          ← 뒤로가기
        </button>

        <h2 className="text-title-md font-bold text-on-surface">{spot.name}</h2>
      </div>

      {/* Action */}
      <div className="flex items-center justify-between">
        {!deleteMode ? (
          <button
            onClick={() => setDeleteMode(true)}
            className="
              rounded-lg
              bg-error
              px-4
              py-2
              text-label-md
              font-bold
              text-on-error
              transition-opacity
              hover:opacity-90
              active:scale-95
            "
          >
            🗑 삭제
          </button>
        ) : (
          <>
            <span className="text-label-md text-on-surface-variant">
              {selectedMediaList.length}개 선택됨
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleCancelDelete}
                className="
                  rounded-lg
                  border
                  border-outline
                  bg-surface
                  px-4
                  py-2
                  text-label-md
                  text-on-surface
                  transition-colors
                  hover:bg-surface-container
                "
              >
                취소
              </button>

              <button
                onClick={handleDelete}
                disabled={selectedMediaList.length === 0}
                className="
                  rounded-lg
                  bg-error
                  px-4
                  py-2
                  text-label-md
                  font-bold
                  text-on-error
                  transition-opacity
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                삭제
              </button>
            </div>
          </>
        )}
      </div>

      {/* Gallery */}
      <MediaGrid
        mediaList={spot.mediaList}
        deleteMode={deleteMode}
        selectedMediaList={selectedMediaList}
        onToggleMedia={toggleMedia}
      />
    </div>
  );
};

export default GalleryView;
