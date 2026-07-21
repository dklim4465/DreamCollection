import { getTripLogStatistics } from "@/travelog/api/tripLogApi";
import { useQuery } from "@tanstack/react-query";

export const useTripLogStatistics = (tno: number) =>
  useQuery({
    queryKey: ["tripStatistics", tno],
    queryFn: () => getTripLogStatistics(tno),
    enabled: !!tno,
  });
