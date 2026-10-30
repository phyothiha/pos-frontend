import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentPlatform,
  getAllPaymentPlatforms,
  getPaymentPlatforms,
} from "./api";

export function usePaymentPlatforms(page = 1) {
  return useQuery({
    queryKey: ["payment-platforms", { page }],
    queryFn: ({ signal }) => getPaymentPlatforms(page, signal),
  });
}

export function useAllPaymentPlatforms() {
  return useQuery({
    queryKey: ["payment-platforms", "all"],
    queryFn: ({ signal }) => getAllPaymentPlatforms(signal),
  });
}

export function useCreatePaymentPlatform() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createPaymentPlatform,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["payment-platforms"] }),
  });
}
