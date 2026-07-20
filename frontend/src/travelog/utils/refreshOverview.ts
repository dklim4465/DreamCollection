import { getSharedTripLog } from "@/travelog/api/shareApi";
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
    thumbnailPath: overview.thumbnailPath,
  });

  useSpotStore.getState().setSpots(overview.spots);
  useMediaStore.getState().setMedia(overview.spots);
};

export const refreshSharedTripLog = async (token: string) => {
  const overview = await getSharedTripLog(token);

  useTripLogStore.getState().setTrip({
    tno: overview.tno,
    title: overview.title,
    startDate: overview.startDate,
    endDate: overview.endDate,
    thumbnailPath: overview.thumbnailPath,
  });

  useSpotStore.getState().setSpots(overview.spots);
  useMediaStore.getState().setMedia(overview.spots);
};
