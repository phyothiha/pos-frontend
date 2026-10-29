import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./api";
import type { CategoryFormValues } from "./schema";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCategories(page = 1) {
  return useQuery({
    queryKey: ["categories", { page }],
    queryFn: ({ signal }) => getCategories(page, signal),
  });
}

export function useUpdateCategory(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CategoryFormValues) => updateCategory(id, values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
