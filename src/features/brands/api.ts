import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type { BrandFormValues } from "@/features/brands/schema";

export interface Brand {
  id: number;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface BrandResponse {
  data: Brand;
}

export async function createBrand(values: BrandFormValues) {
  const response = await api.post<BrandResponse>(
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

export async function updateBrand(id: number, values: BrandFormValues) {
  const response = await api.put<BrandResponse>(
    `/v1/inventory/brands/${id}`,
    values,
  );

  return response.data;
}

export async function deleteBrand(id: number) {
  await api.delete(`/v1/inventory/brands/${id}`);
}
