import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerTripLog } from "@/travelog/api/tripLogApi";
import { TripLogRequestDTO } from "@/travelog/types/tripLog";

export const useCreateTripLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TripLogRequestDTO) => registerTripLog(request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tripLogList"],
      });
    },
  });
};
