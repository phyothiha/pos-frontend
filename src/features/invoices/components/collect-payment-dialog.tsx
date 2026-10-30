import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  collectPaymentFormSchema,
  type CollectPaymentFormValues,
} from "@/features/invoices/schema";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export function CollectPaymentDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const form = useForm<CollectPaymentFormValues>({
    resolver: zodResolver(collectPaymentFormSchema),
    defaultValues: { payment_platform_id: null },
  });
  const collect = useCollectPayment(invoice.id);
  const platforms = useAllPaymentPlatforms();

  function changeOpen(value: boolean) {
    if (collect.isPending) return;
    setOpen(value);
    form.reset();
  }

  async function submit(values: CollectPaymentFormValues) {
    if (collect.isPending) return;
    form.clearErrors();
    try {
      await collect.mutateAsync(values.payment_platform_id);
      setOpen(false);
      toast.success("Payment recorded successfully.");
    } catch (error) {
      if (
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
      ) {
        for (const [key, messages] of Object.entries(
          error.response.data.errors ?? {},
        )) {
          form.setError(
            key === "payment_platform_id" ? "payment_platform_id" : "root",
            { type: "server", message: messages[0] },
          );
        }
        return;
      }
      toast.error("Failed to record payment. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen} disablePointerDismissal>
      <DialogTrigger render={<Button />}>Record Payment</DialogTrigger>
      <DialogContent showCloseButton={!collect.isPending}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-4"
          noValidate
        >
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Confirm that {invoice.grand_total.toLocaleString()} MMK has been
              collected for {invoice.invoice_number}.
            </DialogDescription>
          </DialogHeader>
          <Controller
            name="payment_platform_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="collected-platform">
                  Collection Method
                </FieldLabel>
                <select
                  {...field}
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(event.target.value ? Number(event.target.value) : null)
                  }
                  id="collected-platform"
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                  disabled={collect.isPending}
                  aria-invalid={fieldState.invalid}
                >
                  <option value="">Cash</option>
                  {platforms.data?.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
            )}
          />
          <FieldError errors={[form.formState.errors.root]} />
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
