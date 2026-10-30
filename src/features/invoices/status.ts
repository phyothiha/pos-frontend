import type { DeliveryStatus, Invoice } from "./api";

const deliveryTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ["preparing"],
  preparing: ["ready_for_dispatch"],
  ready_for_dispatch: ["on_the_way"],
  on_the_way: ["delivered", "failed_delivery"],
  failed_delivery: ["on_the_way", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export function getNextDeliveryStatuses(invoice: Pick<Invoice, "status" | "delivery_status">) {
  if (invoice.status === "cancelled") return [];
  if (invoice.status === "draft" && invoice.delivery_status !== "pending") return [];
  return deliveryTransitions[invoice.delivery_status];
}

export function canCancelInvoice(invoice: Pick<Invoice, "status" | "delivery_status">) {
  return (
    invoice.status !== "cancelled" &&
    ["pending", "preparing", "ready_for_dispatch"].includes(invoice.delivery_status)
  );
}
