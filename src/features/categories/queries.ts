import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategory, getCategories } from "./api";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCategories(page = 1) {
  // Use Caching or Query Cancellation concept
  return useQuery({
    queryKey: ["categories", { page }],
    queryFn: ({ signal }) => getCategories(page, signal),
  });
}
