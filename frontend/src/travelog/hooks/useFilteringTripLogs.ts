import { TripLogResponseDTO } from "@/travelog/types/tripLog";
import { useMemo } from "react";

export type TripLogSort = "modified" | "created" | "startDate";
export type SortOrder = "asc" | "desc";

interface UseFilteringTripLogsProps {
  tripLogs: TripLogResponseDTO[];
  keyword: string;
  sort: TripLogSort;
  order: SortOrder;
}

const getTime = (date: string | null) => (date ? new Date(date).getTime() : 0);

const useFilteringTripLogs = ({
  tripLogs,
  keyword,
  sort,
  order,
}: UseFilteringTripLogsProps) => {
  return useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    const filtered = lowerKeyword
      ? tripLogs.filter((tripLog) => {
          const title = tripLog.title?.toLowerCase() ?? "";
          const tags = tripLog.tags?.map((tag) => tag.toLowerCase()) ?? [];

          return (
            title.includes(lowerKeyword) ||
            tags.some((tag) => tag.includes(lowerKeyword))
          );
        })
      : tripLogs;

    return [...filtered].sort((a, b) => {
      let result = 0;

      switch (sort) {
        case "modified":
          result = getTime(a.modifiedAt) - getTime(b.modifiedAt);
          break;
        case "created":
          result = getTime(a.createdAt) - getTime(b.createdAt);
          break;
        case "startDate":
          result = getTime(a.startDate) - getTime(b.startDate);
          break;
      }

      return order == "asc" ? result : -result;
    });
  }, [tripLogs, keyword, sort, order]);
};

export default useFilteringTripLogs;
