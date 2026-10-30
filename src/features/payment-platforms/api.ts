import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";

export interface PaymentPlatform {
  id: number;
  name: string;
}

export async function getPaymentPlatforms(page: number, signal?: AbortSignal) {
  const response = await api.get<PaginatedResponse<PaymentPlatform>>(
    "/v1/inventory/payment-platforms",
    { params: { page }, signal },
  );
  return response.data;
}

export async function getAllPaymentPlatforms(signal?: AbortSignal) {
  const response = await api.get<{ data: PaymentPlatform[] }>(
    "/v1/inventory/payment-platforms/all",
    { signal },
  );
  return response.data.data;
}

export async function createPaymentPlatform(values: { name: string }) {
  const response = await api.post<{ data: PaymentPlatform }>(
    "/v1/inventory/payment-platforms",
    values,
  );
  return response.data.data;
}
