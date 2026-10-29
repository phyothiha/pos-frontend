import { api } from "@/lib/api";
import type { Brand } from "@/features/brands/api";
import type { Category } from "@/features/categories/api";
import type { PaginatedResponse } from "@/types/pagination";
import type { ProductFormValues } from "./schema";

export interface Product {
  id: number;
  category_id: number;
  brand_id: number;
  name: string;
  sku: string;
  selling_price: number;
  stock_quantity: number;
  type: "in_stock" | "pre_order";
  is_active: boolean;
  category?: Category | null;
  brand?: Brand | null;
  created_at: string;
  updated_at: string;
}

export async function getProducts(page: number, signal?: AbortSignal) {
  const response = await api.get<PaginatedResponse<Product>>(
    "/v1/inventory/products",
    {
      params: { page },
      signal,
    },
  );
  return response.data;
}

export async function createProduct(values: ProductFormValues) {
  const response = await api.post<{ data: Product }>("/v1/inventory/products", {
    ...values,
    stock_quantity:
      values.stock_quantity === undefined
        ? undefined
        : Number(values.stock_quantity),
  });
  return response.data;
}

