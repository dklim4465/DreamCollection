import { createShareLink } from "@/travelog/api/shareApi";
import { useMutation } from "@tanstack/react-query";

export const useCreateShareLink = () => {
  return useMutation({
    mutationFn: createShareLink,
  });
};
