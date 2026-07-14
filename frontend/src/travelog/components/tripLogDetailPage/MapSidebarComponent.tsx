import GalleryView from "@/travelog/components/tripLogDetailPage/GalleryView";
import SpotListView from "@/travelog/components/tripLogDetailPage/SpotListView";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { uploadMediaInChunks } from "@/travelog/utils/uploadMediaInChunks";
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
      await uploadMediaInChunks(Number(tno), Array.from(files), (progress) => {
        console.log(progress);
      });
    } catch (error) {
      console.error(error);
      alert("업로드에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <aside
      className="map-sidebar"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 300,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",

        borderLeft: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "-8px 0 24px rgba(0,0,0,0.12)",

        zIndex: 20,
      }}
    >
      <div className="sidebar-header">
        <h3>여행</h3>

        <button onClick={openFileDialog}>+</button>

        <input
          ref={inputRef}
          hidden
          multiple
          type="file"
          accept="image/*,video/*"
          onChange={handleUpload}
        />
      </div>
      {mode === "list" ? <SpotListView /> : <GalleryView />}
    </aside>
  );
};

export default MapSidebarComponent;
