import { useQuery } from "@tanstack/react-query";
import { getInventoryMovements } from "./api";

export function useInventoryMovements(page: number, productId?: number) {
  return useQuery({
    queryKey: ["inventory-movements", { page, productId }],
    queryFn: ({ signal }) => getInventoryMovements(page, productId, signal),
  });
}
