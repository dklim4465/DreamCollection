import { useMediaStore } from "@/travelog/store/useMediaStore";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { formatZonedDateTime } from "@/travelog/utils/date";
import { getMediaUrl } from "@/travelog/utils/media";
import { ArrowLeft, Image } from "lucide-react";

const MediaView = () => {
  const media = useMediaStore((state) => state.selectedMedia);
  const closeMedia = useSidebarStore((state) => state.closeMedia);

  const spots = useSpotStore((state) => state.spots);

  const timezone = spots.find((spot) =>
    spot.mediaList.some((m) => m.mno === media?.mno),
  )?.timezone;

  if (!media) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-high px-4 py-3">
        <div className="grid grid-cols-3 items-center">
          <button
            onClick={closeMedia}
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

          <h2 className="justify-self-center text-title-md font-bold text-on-surface">
            사진
          </h2>

          <div />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <img
          src={getMediaUrl(media)}
          alt=""
          className="w-full rounded-xl object-contain"
          draggable={false}
        />

        <button
          className="
            flex
            mt-4
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-3
            py-2
            font-medium
            text-on-primary
            hover:opacity-90
          "
        >
          <Image size={18} />
          대표 이미지로 설정
        </button>

        <div className="mt-4 space-y-3">
          {media.takenAt && (
            <div>
              <p className="text-label-sm text-on-surface-variant">촬영 시간</p>
              <p className="text-body-md text-on-surface">
                {timezone
                  ? formatZonedDateTime(media.takenAt, timezone)
                  : media.takenAt}
              </p>
            </div>
          )}

          {media.mediaText && (
            <div>
              <p className="text-label-sm text-on-surface-variant">메모</p>
              <p className="whitespace-pre-wrap text-body-md text-on-surface">
                {media.mediaText}
              </p>
            </div>
          )}

          {media.location && (
            <div>
              <p className="text-label-sm text-on-surface-variant">위치</p>
              <p className="text-body-md text-on-surface">
                {media.location.coordinates[1].toFixed(6)},{" "}
                {media.location.coordinates[0].toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaView;
