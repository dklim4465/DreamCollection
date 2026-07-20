import { getListTripLog } from "@/travelog/api/tripLogApi";
import { useQuery } from "@tanstack/react-query";

export const useTripLogList = () => {
  return useQuery({
    queryKey: ["tripLogList"],
    queryFn: () => getListTripLog(),
    staleTime: 1000 * 60,
  });
};
