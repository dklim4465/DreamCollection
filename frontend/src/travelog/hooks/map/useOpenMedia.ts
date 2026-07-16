import { getMedia } from "@/travelog/api/mediaApi";
import { useMediaStore } from "@/travelog/store/useMediaStore";
import { useSidebarStore } from "@/travelog/store/useSidebarStore";

export const useOpenMedia = () => {
  const setSelectedMedia = useMediaStore((state) => state.setSelectedMedia);

  const openMediaView = useSidebarStore((state) => state.openMedia);

  const openMedia = async (mno: number) => {
    try {
      const detail = await getMedia(mno);

      setSelectedMedia(detail);
      openMediaView();
    } catch (error) {
      console.error(error);
      alert("사진을 불러오지 못했습니다.");
    }
  };

  return openMedia;
};
