import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/schema";
import { useUpdateCategory } from "@/features/categories/queries";
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
import type { Category } from "@/features/categories/api";
import type { ApiValidationError } from "@/types/api";

export function EditCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const updateCategory = useUpdateCategory(category.id);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category.name,
      description: category.description ?? "",
    },
  });

  function handleOpenChange(isOpen: boolean) {
    if (updateCategory.isPending) return;
    if (isOpen) {
      form.reset({
        name: category.name,
        description: category.description ?? "",
      });
    }
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      updateCategory.reset();
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    form.clearErrors();
    try {
      await updateCategory.mutateAsync(values);
      form.reset();
      setOpen(false);
      toast.success("Category updated successfully.");
    } catch (error) {
      if (
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
      ) {
        const errors = error.response.data.errors;

        for (const [key, value] of Object.entries(errors)) {
          form.setError(key as keyof CategoryFormValues, {
            type: "server",
            message: value[0],
          });
        }

        return;
      }

      toast.error("Failed to update category. Please try again.");
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
      <DialogContent showCloseButton={!updateCategory.isPending}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`category-name-${category.id}`}>
                    Name *
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`category-name-${category.id}`}
                    disabled={updateCategory.isPending}
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
                  <FieldLabel htmlFor={`category-description-${category.id}`}>
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`category-description-${category.id}`}
                    rows={6}
                    disabled={updateCategory.isPending}
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
                  disabled={updateCategory.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={updateCategory.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
