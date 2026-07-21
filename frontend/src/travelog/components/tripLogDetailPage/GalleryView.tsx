import { deleteMedia } from "@/travelog/api/mediaApi";
import SpotGallerySection from "@/travelog/components/tripLogDetailPage/SpotGallerySection";
import { useOpenMedia } from "@/travelog/hooks/map/useOpenMedia";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { refreshTripLogOverview } from "@/travelog/utils/refreshOverview";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

interface GalleryViewProps {
  readOnly: boolean;
}

const GalleryView = ({ readOnly }: GalleryViewProps) => {
  const setMode = useSidebarStore((state) => state.setMode);

  const spots = useSpotStore((state) => state.spots);

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

  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const gallerySpotId = useSidebarStore((state) => state.gallerySpotId);

  const handleDelete = async () => {
    if (selectedMediaList.length === 0) return;

    try {
      await deleteMedia(selectedMediaList);

      await refreshTripLogOverview(Number(tno));

      setSelectedMediaList([]);
      setDeleteMode(false);

      setMode("list");
    } catch (error) {
      console.error(error);
      alert("미디어 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (!gallerySpotId) return;

    requestAnimationFrame(() => {
      sectionRefs.current[gallerySpotId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [gallerySpotId]);

  const openMedia = useOpenMedia();

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-outline-variant bg-surface-container-high p-4">
        {!deleteMode ? (
          <div className="grid grid-cols-3 items-center">
            {/* Left */}
            <button
              onClick={() => setMode("list")}
              className="
                flex
                items-center
                gap-1
                justify-self-start
                rounded-lg
                p-2
                text-on-surface-variant
                transition-colors
                hover:bg-surface-container
                hover:text-on-surface
              "
            >
              <ArrowLeft size={20} />
            </button>

            {/* Center */}
            <h2 className="justify-self-center text-title-md font-bold text-on-surface">
              전체 사진
            </h2>

            {/* Right */}
            {!readOnly && (
              <button
                onClick={() => setDeleteMode(true)}
                className="
                justify-self-end
                rounded-lg
                p-2
                text-on-surface-variant
                transition-colors
                hover:bg-error-container
                hover:text-error
              "
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 items-center">
            {/* Left */}
            <button
              onClick={handleCancelDelete}
              className="
                justify-self-start
                rounded-lg
                px-3
                py-2
                text-label-md
                text-on-surface-variant
                transition-colors
                hover:bg-surface-container
                hover:text-on-surface
              "
            >
              취소
            </button>

            {/* Center */}
            <span className="justify-self-center text-label-lg font-semibold text-on-surface">
              {selectedMediaList.length}개 선택됨
            </span>

            {/* Right */}
            <button
              onClick={handleDelete}
              disabled={selectedMediaList.length === 0}
              className="
                justify-self-end
                rounded-lg
                bg-error
                px-3
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
        )}
      </div>

      {/* Gallery */}
      <div className="flex flex-col gap-8 m-4">
        {spots.map((spot) => (
          <SpotGallerySection
            key={spot.sno}
            ref={(el) => {
              sectionRefs.current[spot.sno] = el;
            }}
            spot={spot}
            deleteMode={deleteMode}
            selectedMediaList={selectedMediaList}
            onToggleMedia={toggleMedia}
            openMedia={openMedia}
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryView;
