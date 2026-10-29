import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type { BrandFormValues } from "@/features/brands/schema";

export interface Brand {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function createBrand(values: BrandFormValues) {
  const response = await api.post<{ data: Brand }>(
    "/v1/inventory/brands",
    values,
  );

  return response.data;
}

export async function getBrands(page: number, signal?: AbortSignal) {
  const response = await api.get<PaginatedResponse<Brand>>(
    "/v1/inventory/brands",
    {
      params: { page },
      signal,
    },
  );

  return response.data;
}

export async function getAllBrands(signal?: AbortSignal) {
  const response = await api.get<{ data: Brand[] }>(
    "/v1/inventory/brands/all",
    { signal },
  );
  return response.data.data;
}

export async function updateBrand(id: number, values: BrandFormValues) {
  const response = await api.put<{ data: Brand }>(
    `/v1/inventory/brands/${id}`,
    values,
  );

  return response.data;
}

export async function deleteBrand(id: number) {
  await api.delete(`/v1/inventory/brands/${id}`);
}
