import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  getProducts,
} from "./api";

export function useProducts(page = 1) {
  return useQuery({
    queryKey: ["products", { page }],
    queryFn: ({ signal }) => getProducts(page, signal),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

