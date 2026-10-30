import type { Invoice } from "./api";

export function canCancelInvoice(invoice: Pick<Invoice, "status" | "delivery_status">) {
  return (
    invoice.status !== "cancelled" &&
    ["pending", "preparing", "ready_for_dispatch"].includes(invoice.delivery_status)
  );
}
