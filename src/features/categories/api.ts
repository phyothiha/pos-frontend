import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type { CategoryFormValues } from "@/features/categories/schema";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function createCategory(values: CategoryFormValues) {
  const response = await api.post<{ data: Category }>(
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

export async function getAllCategories(signal?: AbortSignal) {
  const response = await api.get<{ data: Category[] }>(
    "/v1/inventory/categories/all",
    { signal },
  );
  return response.data.data;
}

export async function updateCategory(id: number, values: CategoryFormValues) {
  const response = await api.put<{ data: Category }>(
    `/v1/inventory/categories/${id}`,
    values,
  );

  return response.data;
}

export async function deleteCategory(id: number) {
  await api.delete(`/v1/inventory/categories/${id}`);
}
