import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";

export interface InventoryMovement {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  invoice_item_id: number | null;
  invoice_id: number | null;
  user_id: number | null;
  user_name: string | null;
  type: "opening" | "receipt" | "adjustment" | "sale" | "cancellation";
  quantity: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

export async function getInventoryMovements(page: number, productId?: number, signal?: AbortSignal) {
  const response = await api.get<PaginatedResponse<InventoryMovement>>(
    "/v1/inventory/movements",
    { params: { page, product_id: productId }, signal },
  );
  return response.data;
}
