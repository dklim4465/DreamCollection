import GalleryView from "@/travelog/components/tripLogDetailPage/GalleryView";
import SpotListView from "@/travelog/components/tripLogDetailPage/SpotListView";
import { startUpload } from "@/travelog/service/UploadManager";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
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
        border-l border-white/20
        bg-black/80
        backdrop-blur-md
        shadow-[-8px_0_24px_rgba(0,0,0,0.12)]
      "
    >
      <div
        className="
          flex items-center justify-between
          border-b border-white/20
          px-5 py-4
        "
      >
        <h3 className="text-title-md font-bold text-white">여행</h3>

        <button
          onClick={openFileDialog}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-full
            bg-primary
            text-on-primary
            text-xl
            transition
            hover:opacity-90
            active:scale-95
          "
        >
          +
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
