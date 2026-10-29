import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/schema";
import { useCreateCategory } from "@/features/categories/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const createCategory = useCreateCategory();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "" },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (createCategory.isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      createCategory.reset();
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    form.clearErrors();
    try {
      await createCategory.mutateAsync(values);
      form.reset();
      setOpen(false);
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon />
        Add Category
      </DialogTrigger>
      <DialogContent showCloseButton={!createCategory.isPending}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Enter a name and an optional description for the category.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-name">
                    Name <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="category-name"
                    disabled={createCategory.isPending}
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
                  <FieldLabel htmlFor="category-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="category-description"
                    rows={6}
                    disabled={createCategory.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          {form.formState.errors.root && (
            <FieldError errors={[form.formState.errors.root]} />
          )}
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={createCategory.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={createCategory.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
