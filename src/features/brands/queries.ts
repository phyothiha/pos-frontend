import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "./api";
import type { BrandFormValues } from "./schema";

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBrand,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useBrands(page = 1) {
  return useQuery({
    queryKey: ["brands", { page }],
    queryFn: ({ signal }) => getBrands(page, signal),
  });
}

export function useUpdateBrand(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BrandFormValues) => updateBrand(id, values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });
}
