import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/features/products/api";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schema";
import { useUpdateProduct } from "@/features/products/queries";
import { useAllCategories } from "@/features/categories/queries";
import { useAllBrands } from "@/features/brands/queries";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm disabled:opacity-50";

export function EditProductDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateProduct(product.id);
  const categories = useAllCategories();
  const brands = useAllBrands();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
  });

  function changeOpen(value: boolean) {
    if (update.isPending) return;
    if (value) {
      form.reset({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        brand_id: product.brand_id,
        selling_price: product.selling_price,
        stock_quantity: product.stock_quantity,
        type: product.type,
        is_active: product.is_active,
      });
    }
    setOpen(value);
    update.reset();
  }

  async function submit(values: ProductFormValues) {
    if (update.isPending) return;
    form.clearErrors();
    try {
      await update.mutateAsync(values);
      setOpen(false);
      toast.success("Product updated successfully.");
    } catch (error) {
      if (
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
      ) {
        for (const [key, messages] of Object.entries(
          error.response.data.errors ?? {},
        )) {
          if (key in productFormSchema.shape) {
            form.setError(key as keyof ProductFormValues, {
              type: "server",
              message: messages[0],
            });
          } else {
            toast.error(messages[0]);
          }
        }
        return;
      }
      toast.error("Failed to update product. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen} disablePointerDismissal>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        <PencilIcon />
        Edit
      </DialogTrigger>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        showCloseButton={!update.isPending}
      >
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <fieldset
            disabled={update.isPending}
            className="grid gap-4 md:grid-cols-2"
          >
            {(
              [
                ["name", "Name", "text", 255],
                ["sku", "SKU", "text", 100],
                ["selling_price", "Selling Price", "number", undefined],
                ["stock_quantity", "Available Quantity", "number", undefined],
              ] as const
            ).map(([name, label, type, maxLength]) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`product-${name}-${product.id}`}>
                      {label}
                    </FieldLabel>
                    <Input
                      {...field}
                      value={Number.isNaN(field.value) ? "" : field.value ?? ""}
                      onChange={(event) => field.onChange(
                        type === "number" ? event.target.valueAsNumber : event.target.value,
                      )}
                      id={`product-${name}-${product.id}`}
                      type={type}
                      maxLength={maxLength}
                      min={type === "number" ? 0 : undefined}
                      step={type === "number" ? 1 : undefined}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}
            {(
              [
                ["category_id", "Category", categories],
                ["brand_id", "Brand", brands],
              ] as const
            ).map(([name, label, query]) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`product-${name}-${product.id}`}>
                      {label}
                    </FieldLabel>
                    <select
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                      id={`product-${name}-${product.id}`}
                      className={selectClass}
                      disabled={
                        update.isPending || query.isPending || query.isError
                      }
                      aria-invalid={fieldState.invalid}
                    >
                      <option value={0}>Select a {label.toLowerCase()}</option>
                      {query.data?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    {query.isPending && (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    )}
                    {query.isError && (
                      <p role="alert" className="text-sm text-destructive">
                        Failed to load options.{" "}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => query.refetch()}
                        >
                          Retry
                        </button>
                      </p>
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`product-type-${product.id}`}>
                    Type
                  </FieldLabel>
                  <select
                    {...field}
                    id={`product-type-${product.id}`}
                    className={selectClass}
                    aria-invalid={fieldState.invalid}
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="pre_order">Pre-Order</option>
                  </select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="is_active"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`product-status-${product.id}`}>
                    Status
                  </FieldLabel>
                  <select
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ? "active" : "inactive"}
                    onChange={(event) =>
                      field.onChange(event.target.value === "active")
                    }
                    id={`product-status-${product.id}`}
                    className={selectClass}
                    aria-invalid={fieldState.invalid}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={update.isPending}
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                update.isPending ||
                categories.isPending ||
                categories.isError ||
                brands.isPending ||
                brands.isError
              }
            >
              {update.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
