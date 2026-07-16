import { getTripLogOverview } from "@/travelog/api/tripLogApi";
import { useMediaStore } from "@/travelog/store/useMediaStore";
import { useSpotStore } from "@/travelog/store/useSpotStore";
import { useTripLogStore } from "@/travelog/store/useTripLogStore";

export const refreshTripLogOverview = async (tno: number) => {
  const overview = await getTripLogOverview(tno);

  useTripLogStore.getState().setTrip({
    tno: overview.tno,
    title: overview.title,
    startDate: overview.startDate,
    endDate: overview.endDate,
  });

  useSpotStore.getState().setSpots(overview.spots);
  useMediaStore.getState().setMedia(overview.spots);
};
