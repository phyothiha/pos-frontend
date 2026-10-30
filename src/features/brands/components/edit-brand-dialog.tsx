import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  brandFormSchema,
  type BrandFormValues,
} from "@/features/brands/schema";
import { useUpdateBrand } from "@/features/brands/queries";
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
import type { Brand } from "@/features/brands/api";
import type { ApiValidationError } from "@/types/api";

export function EditBrandDialog({ brand }: { brand: Brand }) {
  const [open, setOpen] = useState(false);
  const updateBrand = useUpdateBrand(brand.id);
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: brand.name,
      description: brand.description ?? "",
    },
  });

  function handleOpenChange(isOpen: boolean) {
    if (updateBrand.isPending) return;
    if (isOpen) {
      form.reset({
        name: brand.name,
        description: brand.description ?? "",
      });
    }
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      updateBrand.reset();
    }
  }

  async function onSubmit(values: BrandFormValues) {
    form.clearErrors();
    try {
      await updateBrand.mutateAsync(values);
      form.reset();
      setOpen(false);
      toast.success("Brand updated successfully.");
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

      toast.error("Failed to update brand. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        <PencilIcon />
        Edit
      </DialogTrigger>
      <DialogContent showCloseButton={!updateBrand.isPending}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`brand-name-${brand.id}`}>
                    Name *
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`brand-name-${brand.id}`}
                    disabled={updateBrand.isPending}
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
                  <FieldLabel htmlFor={`brand-description-${brand.id}`}>
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`brand-description-${brand.id}`}
                    rows={6}
                    disabled={updateBrand.isPending}
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
                  disabled={updateBrand.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={updateBrand.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
