import { deleteMedia } from "@/travelog/api/mediaApi";
import MediaGrid from "@/travelog/components/tripLogDetailPage/MediaGrid";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useState } from "react";

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

  const handleDelete = async () => {
    if (selectedMediaList.length === 0) return;

    try {
      await deleteMedia(selectedMediaList);

      // Store에서도 삭제

      setSelectedMediaList([]);
      setDeleteMode(false);
    } catch (error) {
      console.error(error);
      alert("미디어 삭제에 실패했습니다.");
    }
  };

  if (!spot) return null;

  return (
    <>
      <button onClick={closeGallery}>뒤로가기</button>

      <h2>{spot.name}</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        {!deleteMode ? (
          <>
            <button onClick={() => setDeleteMode(true)}>🗑 삭제</button>
          </>
        ) : (
          <>
            <span>{selectedMediaList.length}개 선택됨</span>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleCancelDelete}>취소</button>

              <button
                onClick={handleDelete}
                disabled={selectedMediaList.length === 0}
              >
                삭제
              </button>
            </div>
          </>
        )}
      </div>

      <MediaGrid
        mediaList={spot.mediaList}
        deleteMode={deleteMode}
        selectedMediaList={selectedMediaList}
        onToggleMedia={toggleMedia}
      />
    </>
  );
};

export default GalleryView;
