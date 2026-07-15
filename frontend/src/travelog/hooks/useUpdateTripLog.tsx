import { updateTripLog } from "@/travelog/api/tripLogApi";
import { TripLogRequestDTO } from "@/travelog/types/tripLog";
import { useMutation } from "@tanstack/react-query";

export const useUpdateTripLog = () => {
  return useMutation({
    mutationFn: ({
      tno,
      request,
    }: {
      tno: number;
      request: TripLogRequestDTO;
    }) => updateTripLog(tno, request),
  });
};
