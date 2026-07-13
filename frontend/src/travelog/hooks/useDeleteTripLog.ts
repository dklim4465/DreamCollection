import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTripLog } from "@/travelog/api/tripLogApi";

export const useDeleteTripLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tno: number) => deleteTripLog(tno),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tripLogList"],
      });
    },
  });
};
