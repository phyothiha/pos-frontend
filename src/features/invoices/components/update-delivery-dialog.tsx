import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import type { DeliveryStatus, Invoice } from "@/features/invoices/api";
import { useUpdateInvoiceDelivery } from "@/features/invoices/queries";
import { getNextDeliveryStatuses } from "@/features/invoices/status";
import type { ApiValidationError } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function UpdateDeliveryDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<DeliveryStatus | "">("");
  const [error, setError] = useState("");
  const update = useUpdateInvoiceDelivery(invoice.id);
  const statuses = getNextDeliveryStatuses(invoice);

  function changeOpen(value: boolean) {
    if (update.isPending) return;
    setOpen(value);
    setStatus(statuses[0] ?? "");
    setError("");
  }

  async function submit() {
    if (update.isPending || !status) return;
    setError("");
    try {
      await update.mutateAsync(status);
      setOpen(false);
      toast.success("Delivery status updated successfully.");
    } catch (error) {
      setError(
        isAxiosError<ApiValidationError>(error) && error.response?.status === 422
          ? Object.values(error.response.data.errors ?? {}).flat().join(" ") || error.response.data.message
          : "Failed to update delivery. Please try again.",
      );
    }
  }

  if (statuses.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={changeOpen} disablePointerDismissal>
      <DialogTrigger render={<Button variant="outline" />}>Update Delivery</DialogTrigger>
      <DialogContent showCloseButton={!update.isPending}>
        <DialogHeader>
          <DialogTitle>Update Delivery</DialogTitle>
          <DialogDescription>
            Current status: {invoice.delivery_status.replaceAll("_", " ")}. Select the next delivery status.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="delivery-status">Delivery Status</FieldLabel>
          <select
            id="delivery-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as DeliveryStatus)}
            disabled={update.isPending}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm capitalize"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
            ))}
          </select>
        </Field>
        {status === "returned" && (
          <p className="text-sm text-muted-foreground">
            Confirm only after all returned goods have been received. Deducted stock will be restored.
            {invoice.payment_status === "paid" && " Refunds must be handled separately."}
          </p>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" disabled={update.isPending} onClick={() => changeOpen(false)}>Cancel</Button>
          <Button disabled={update.isPending || !status} onClick={submit}>
            {update.isPending ? "Saving..." : status === "returned" ? "Confirm Goods Received" : "Update Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
