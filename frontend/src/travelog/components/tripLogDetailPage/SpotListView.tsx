import MediaThumbnail from "@/travelog/components/tripLogDetailPage/MediaThumbnail";
import { useOpenMedia } from "@/travelog/hooks/map/useOpenMedia";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { formatZonedDateTime } from "@/travelog/utils/date";
import { Images } from "lucide-react";

const SpotListView = () => {
  const spots = useSpotStore((state) => state.spots);
  const setSelectedSpot = useSpotStore((state) => state.setSelectedSpot);

  const expandedSpotId = useSidebarStore((state) => state.expandedSpotId);
  const setExpandedSpot = useSidebarStore((state) => state.setExpandedSpot);
  const openGallery = useSidebarStore((state) => state.openGallery);

  const openMedia = useOpenMedia();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-title-md font-bold text-on-surface">여행 일정</h2>

      <div className="flex flex-col gap-2">
        {spots.map((spot) => {
          const expanded = expandedSpotId === spot.sno;

          return (
            <div
              key={spot.sno}
              className={`
                rounded-xl transition-colors
                ${
                  expanded
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                }
              `}
            >
              <button
                className="w-full px-4 py-3 text-left text-label-md font-semibold"
                onClick={() => {
                  setSelectedSpot(spot);
                  setExpandedSpot(spot.sno);
                }}
              >
                {spot.name}
              </button>

              {expanded && (
                <div className="border-t border-outline-variant px-4 pb-4 pt-3">
                  {/* 설명 */}
                  {spot.description && (
                    <p className="mb-3 text-body-sm">{spot.description}</p>
                  )}

                  {/* 시간 */}
                  <div className="mb-3 space-y-1 text-body-sm text-on-surface-variant">
                    {spot.visitAt && (
                      <p>
                        방문: {formatZonedDateTime(spot.visitAt, spot.timezone)}
                      </p>
                    )}

                    {spot.leaveAt && (
                      <p>
                        종료: {formatZonedDateTime(spot.leaveAt, spot.timezone)}
                      </p>
                    )}
                  </div>

                  {/* 썸네일 */}
                  {spot.mediaList.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {spot.mediaList.slice(0, 5).map((media) => (
                        <MediaThumbnail
                          key={media.mno}
                          media={media}
                          size="aspect-square w-full"
                          onClick={() => openMedia(media.mno)}
                        />
                      ))}

                      <button
                        onClick={() => openGallery(spot.sno)}
                        className="
                            flex
                            aspect-square
                            w-full
                            items-center
                            justify-center
                            rounded-lg
                            bg-surface-variant
                            text-on-surface
                            text-sm
                            font-bold
                            transition-colors
                            hover:bg-outline-variant
                            active:scale-95
                          "
                      >
                        {spot.mediaList.length > 5 ? (
                          `+${spot.mediaList.length - 5}`
                        ) : (
                          <Images size={20} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpotListView;
