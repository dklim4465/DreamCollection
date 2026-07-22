import StatisticsView from "@/travelog/components/common/StatisticsView";
import GalleryView from "@/travelog/components/tripLogDetailPage/GalleryView";
import MediaView from "@/travelog/components/tripLogDetailPage/MediaView";
import SpotListView from "@/travelog/components/tripLogDetailPage/SpotListView";
import { startUpload } from "@/travelog/service/UploadManager";
import { SidebarMode, useSidebarStore } from "@/travelog/store/useSidebarStore";
import { useTripLogStore } from "@/travelog/store/useTripLogStore";
import { Plus } from "lucide-react";
import React, { useRef } from "react";
import { BarChart3, Images, MapPinned } from "lucide-react";

interface MapSidebarComponentProps {
  readOnly: boolean;
}

const MapSidebarComponent = ({ readOnly }: MapSidebarComponentProps) => {
  const { mode, setMode } = useSidebarStore();

  const tabs: {
    key: Exclude<SidebarMode, "media">;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      key: "list",
      label: "스팟",
      icon: MapPinned,
    },
    {
      key: "gallery",
      label: "갤러리",
      icon: Images,
    },
    {
      key: "stats",
      label: "여행통계",
      icon: BarChart3,
    },
  ];

  const tripLog = useTripLogStore((state) => state.tripLog);

  const inputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tripLog) return;

    const tno = tripLog.tno;

    const files = e.target.files;

    if (!files || files.length === 0) return;

    try {
      await startUpload(Number(tno), Array.from(files));
    } catch (error) {
      console.error(error);
      alert("업로드에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <aside
      className="
        absolute right-0 top-0 z-20
        flex h-full w-[300px]
        flex-col
        border-l border-outline-variant
        bg-surface-container-high/90
        text-on-surface
        backdrop-blur-xl
        shadow-xl
      "
    >
      <div
        className="
          flex items-center justify-between
          border-b border-outline-variant
          px-5 py-4
        "
      >
        <h3 className="text-title-md font-bold">여행</h3>

        {!readOnly && (
          <>
            <button
              onClick={openFileDialog}
              className="
                flex h-9 w-9 items-center justify-center
                rounded-full
                bg-primary
                text-on-primary
                transition
                hover:opacity-90
                active:scale-95
              "
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>

            <input
              ref={inputRef}
              hidden
              multiple
              type="file"
              accept="image/*,video/*"
              onChange={handleUpload}
            />
          </>
        )}
      </div>

      <div className="flex border-b border-outline-variant bg-surface-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm transition ${
                mode === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto hide-scrollbar">
        {mode === "list" && <SpotListView />}
        {mode === "gallery" && <GalleryView readOnly={readOnly} />}
        {mode === "stats" && tripLog != null && (
          <StatisticsView tno={tripLog.tno} />
        )}
        {mode === "media" && <MediaView readOnly={readOnly} />}
      </div>
    </aside>
  );
};

export default MapSidebarComponent;
