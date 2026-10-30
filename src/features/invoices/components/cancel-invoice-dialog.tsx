import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import type { Invoice } from "@/features/invoices/api";
import { useCancelInvoice } from "@/features/invoices/queries";
import type { ApiValidationError } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function CancelInvoiceDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const cancel = useCancelInvoice(invoice.id);

  function changeOpen(value: boolean) {
    if (cancel.isPending) return;
    setOpen(value);
    setError("");
  }

  async function submit() {
    if (cancel.isPending) return;
    setError("");
    try {
      await cancel.mutateAsync();
      setOpen(false);
      toast.success("Invoice cancelled. Deducted quantities have been restored.");
    } catch (error) {
      setError(
        isAxiosError<ApiValidationError>(error) && error.response?.status === 422
          ? Object.values(error.response.data.errors ?? {}).flat().join(" ") || error.response.data.message
          : "Failed to cancel invoice. Please try again.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen} disablePointerDismissal>
      <DialogTrigger render={<Button variant="destructive" />}>
        Cancel Invoice
      </DialogTrigger>
      <DialogContent showCloseButton={!cancel.isPending}>
        <DialogHeader>
          <DialogTitle>Cancel Invoice</DialogTitle>
          <DialogDescription>
            Cancel this invoice? Stock will be restored. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {invoice.payment_status === "paid" && (
          <p className="text-sm text-muted-foreground">
            This invoice is paid. Refunds must be handled separately.
          </p>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" disabled={cancel.isPending} onClick={() => changeOpen(false)}>
            Keep Invoice
          </Button>
          <Button variant="destructive" disabled={cancel.isPending} onClick={submit}>
            {cancel.isPending ? "Cancelling..." : "Cancel Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
