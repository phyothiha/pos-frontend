import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type { PaymentPlatform } from "@/features/payment-platforms/api";
import type { InvoiceFormValues } from "./schema";

export interface InvoiceItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_type: "in_stock" | "pre_order";
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_phone: string;
  delivery_phone: string;
  delivery_address: string;
  status: "draft" | "confirmed" | "cancelled";
  payment_type: "paid" | "cod";
  payment_status: "paid" | "unpaid";
  payment_platform_id: number | null;
  payment_platform: PaymentPlatform | null;
  delivery_status: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  grand_total: number;
  items: InvoiceItem[];
}

export async function getInvoices(page: number, signal?: AbortSignal) {
  const response = await api.get<PaginatedResponse<Invoice>>(
    "/v1/inventory/invoices",
    { params: { page }, signal },
  );
  return response.data;
}

export async function getInvoice(id: number, signal?: AbortSignal) {
  const response = await api.get<{ data: Invoice }>(
    `/v1/inventory/invoices/${id}`,
    { signal },
  );
  return response.data.data;
}

export async function createInvoice(values: InvoiceFormValues) {
  const response = await api.post<{ data: Invoice }>("/v1/inventory/invoices", {
    ...values,
    payment_platform_id:
      values.payment_type === "paid" ? values.payment_platform_id : null,
  });
  return response.data.data;
}

export async function collectPayment(id: number, platformId: number | null) {
  const response = await api.patch<{ data: Invoice }>(
    `/v1/inventory/invoices/${id}/payment`,
    {
      payment_status: "paid",
      payment_platform_id: platformId,
    },
  );
  return response.data.data;
}

export async function cancelInvoice(id: number) {
  const response = await api.patch<{ data: Invoice }>(
    `/v1/inventory/invoices/${id}/status`,
    { status: "cancelled" },
  );
  return response.data.data;
}
