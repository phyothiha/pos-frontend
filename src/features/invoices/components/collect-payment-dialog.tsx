import { useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import type { Invoice } from "@/features/invoices/api";
import { useCollectPayment } from "@/features/invoices/queries";
import { useAllPaymentPlatforms } from "@/features/payment-platforms/queries";
import type { ApiValidationError } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";

export function CollectPaymentDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [platformId, setPlatformId] = useState("");
  const [error, setError] = useState("");
  const collect = useCollectPayment(invoice.id);
  const platforms = useAllPaymentPlatforms();

  function changeOpen(value: boolean) {
    if (collect.isPending) return;
    setOpen(value);
    setError("");
    setPlatformId("");
  }

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (collect.isPending) return;
    setError("");
    try {
      await collect.mutateAsync(platformId ? Number(platformId) : null);
      setOpen(false);
      toast.success("Payment recorded successfully.");
    } catch (error) {
      setError(
        isAxiosError<ApiValidationError>(error) &&
          error.response?.status === 422
          ? Object.values(error.response.data.errors ?? {})
              .flat()
              .join(" ")
          : "Failed to record payment. Please try again.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen} disablePointerDismissal>
      <DialogTrigger render={<Button />}>Record Payment</DialogTrigger>
      <DialogContent showCloseButton={!collect.isPending}>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Confirm that {invoice.grand_total.toLocaleString()} MMK has been
              collected for {invoice.invoice_number}.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="collected-platform">
              Collection Method
            </FieldLabel>
            <select
              id="collected-platform"
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              value={platformId}
              onChange={(event) => setPlatformId(event.target.value)}
              disabled={collect.isPending}
            >
              <option value="">Cash</option>
              {platforms.data?.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
            {platforms.isPending && (
              <p className="text-sm">Loading payment platforms...</p>
            )}
            {platforms.isError && (
              <p role="alert" className="text-sm text-destructive">
                Failed to load electronic payment methods.{" "}
                <button
                  className="underline"
                  type="button"
                  onClick={() => platforms.refetch()}
                >
                  Retry
                </button>
              </p>
            )}
          </Field>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={collect.isPending}
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={collect.isPending}>
              {collect.isPending ? "Saving..." : "Confirm Collected"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
