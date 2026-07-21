import MediaGrid from "@/travelog/components/tripLogDetailPage/MediaGrid";
import { SpotDetailDTO } from "@/travelog/types/tripLog";
import { forwardRef } from "react";

interface SpotGallerySectionProps {
  spot: SpotDetailDTO;
  deleteMode: boolean;
  selectedMediaList: number[];
  onToggleMedia: (mno: number) => void;
  openMedia?: (mno: number) => void;
}

const SpotGallerySection = forwardRef<HTMLDivElement, SpotGallerySectionProps>(
  ({ spot, deleteMode, selectedMediaList, onToggleMedia, openMedia }, ref) => {
    return (
      <section ref={ref} className="scroll-mt-20 flex flex-col gap-3">
        <h3 className="text-title-sm font-bold text-on-surface">{spot.name}</h3>

        <MediaGrid
          mediaList={spot.mediaList}
          deleteMode={deleteMode}
          selectedMediaList={selectedMediaList}
          onToggleMedia={onToggleMedia}
          openMedia={openMedia}
        />
      </section>
    );
  },
);

export default SpotGallerySection;
