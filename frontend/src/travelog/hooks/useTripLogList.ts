import { getListTripLog } from "@/travelog/api/tripLogApi";
import { useQuery } from "@tanstack/react-query";

export const useTripLogList = (keyword: string, sort: string) => {
  return useQuery({
    queryKey: ["tripLogList", keyword, sort],
    queryFn: () => getListTripLog(keyword, sort),
    staleTime: 1000 * 60,
  });
};
