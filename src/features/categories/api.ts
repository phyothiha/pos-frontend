import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type { CategoryFormValues } from "@/features/categories/schema";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CategoryResponse {
  data: Category;
}

export async function createCategory(values: CategoryFormValues) {
  const response = await api.post<CategoryResponse>(
    "/v1/inventory/categories",
    values,
  );

  return response.data;
}

export async function getCategories(page: number, signal?: AbortSignal) {
  const response = await api.get<PaginatedResponse<Category>>(
    "/v1/inventory/categories",
    {
      params: { page },
      signal,
    },
  );

  return response.data;
}
