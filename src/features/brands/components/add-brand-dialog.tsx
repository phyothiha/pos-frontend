import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  brandFormSchema,
  type BrandFormValues,
} from "@/features/brands/schema";
import { useCreateBrand } from "@/features/brands/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ApiValidationError } from "@/types/api";

export function AddBrandDialog() {
  const [open, setOpen] = useState(false);
  const createBrand = useCreateBrand();
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "", description: "" },
  });

  function handleOpenChange(isOpen: boolean) {
    if (createBrand.isPending) return;
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      createBrand.reset();
    }
  }

  async function onSubmit(values: BrandFormValues) {
    form.clearErrors();
    try {
      await createBrand.mutateAsync(values);
      form.reset();
      setOpen(false);
      toast.success("Brand created successfully.");
    } catch (error) {
      if (
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
      ) {
        const errors = error.response.data.errors;

        for (const [key, value] of Object.entries(errors)) {
          form.setError(key as keyof BrandFormValues, {
            type: "server",
            message: value[0],
          });
        }

        return;
      }

      toast.error("Failed to create brand. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon />
        Add Brand
      </DialogTrigger>
      <DialogContent showCloseButton={!createBrand.isPending}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="brand-name">
                    Name <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="brand-name"
                    disabled={createBrand.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="brand-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="brand-description"
                    rows={6}
                    disabled={createBrand.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={createBrand.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createBrand.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
