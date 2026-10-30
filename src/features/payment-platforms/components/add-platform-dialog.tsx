import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useCreatePaymentPlatform } from "@/features/payment-platforms/queries";
import type { ApiValidationError } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const platformSchema = z.object({
  name: z.string().trim().min(1, "Platform name is required.").max(100),
});

export function AddPlatformDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreatePaymentPlatform();
  const form = useForm<z.infer<typeof platformSchema>>({
    resolver: zodResolver(platformSchema),
    defaultValues: { name: "" },
  });
  function changeOpen(value: boolean) {
    if (create.isPending) return;
    setOpen(value);
    form.reset();
  }
  async function submit(values: z.infer<typeof platformSchema>) {
    if (create.isPending) return;
    form.clearErrors();
    try {
      await create.mutateAsync(values);
      form.reset();
      setOpen(false);
      toast.success("Payment platform created successfully.");
    } catch (error) {
      if (
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
      ) {
        form.setError("name", {
          message:
            error.response.data.errors?.name?.[0] ??
            error.response.data.message,
        });

        return;
      }

      toast.error("Failed to create payment platform. Please try again.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen} disablePointerDismissal>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Add Platform
      </DialogTrigger>
      <DialogContent showCloseButton={!create.isPending}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(submit)}
          noValidate
        >
          <DialogHeader>
            <DialogTitle>Add Payment Platform</DialogTitle>
          </DialogHeader>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="platform-name">Name *</FieldLabel>
            <Input
              id="platform-name"
              maxLength={100}
              disabled={create.isPending}
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={create.isPending}
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
