import { useSidebarStore } from "@/travelog/store/useSidebarStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";

const SpotListView = () => {
  const spots = useSpotStore((state) => state.spots);
  const selectedSpot = useSpotStore((state) => state.selectedSpot);
  const setSelectedSpot = useSpotStore((state) => state.setSelectedSpot);

  const expandedSpotId = useSidebarStore((state) => state.expandedSpotId);
  const setExpandedSpot = useSidebarStore((state) => state.setExpandedSpot);
  const openGallery = useSidebarStore((state) => state.openGallery);

  return (
    <>
      <h2>여행 일정</h2>

      {spots.map((spot) => (
        <div key={spot.sno}>
          <button
            onClick={() => {
              setSelectedSpot(spot);
              setExpandedSpot(spot.sno);
            }}
          >
            {spot.name}sfda
          </button>

          {expandedSpotId == spot.sno && (
            <>
              <div>미디어 {spot.mediaList.length}개</div>

              <button onClick={() => openGallery(spot.sno)}>전체 보기</button>
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default SpotListView;
