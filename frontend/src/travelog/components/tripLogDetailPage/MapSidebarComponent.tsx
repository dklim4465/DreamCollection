import GalleryView from "@/travelog/components/tripLogDetailPage/GalleryView";
import SpotListView from "@/travelog/components/tripLogDetailPage/SpotListView";
import { startUpload } from "@/travelog/service/UploadManager";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { Plus } from "lucide-react";
import React, { useRef } from "react";
import { useParams } from "react-router-dom";

const MapSidebarComponent = () => {
  const mode = useSidebarStore((state) => state.mode);

  const { tno } = useParams();

  const inputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tno) return;

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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {mode === "list" ? <SpotListView /> : <GalleryView />}
      </div>
    </aside>
  );
};

export default MapSidebarComponent;
