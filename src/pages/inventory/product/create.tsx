import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schema";
import { useCreateProduct } from "@/features/products/queries";
import { useAllBrands } from "@/features/brands/queries";
import { useAllCategories } from "@/features/categories/queries";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiValidationError } from "@/types/api";

export function CreateProduct() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const categories = useAllCategories();
  const brands = useAllBrands();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      category_id: 0,
      brand_id: 0,
      selling_price: 0,
      stock_quantity: 0,
      type: "in_stock",
      is_active: true,
    },
  });
  const saving = createProduct.isPending;

  async function onSubmit(values: ProductFormValues) {
    if (saving) return;
    form.clearErrors();
    try {
      await createProduct.mutateAsync(values);
      toast.success("Product created successfully.");
      navigate("/products");
    } catch (error) {
      if (
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
      ) {
        let firstField: keyof ProductFormValues | undefined;
        for (const [key, messages] of Object.entries(
          error.response.data.errors ?? {},
        )) {
          if (key in productFormSchema.shape) {
            const field = key as keyof ProductFormValues;
            form.setError(field, { type: "server", message: messages[0] });
            firstField ??= field;
          } else {
            toast.error(messages[0]);
          }
        }
        if (firstField) form.setFocus(firstField);
        return;
      }
      toast.error("Failed to create product. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Add Product</h1>
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => navigate("/products")}
        >
          <ArrowLeftIcon /> Back to Products
        </Button>
      </div>
      <Card className="max-w-4xl">
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FieldGroup className="grid gap-6 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-name">
                      Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="product-name"
                      maxLength={255}
                      disabled={saving}
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="sku"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-sku">
                      SKU <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="product-sku"
                      maxLength={100}
                      disabled={saving}
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="category_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-category">
                      Category <span className="text-red-500">*</span>
                    </FieldLabel>
                    <select
                      {...field}
                      id="product-category"
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
                      disabled={saving}
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                    >
                      <option value={0}>Select a category</option>
                      {categories.data?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="brand_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-brand">
                      Brand <span className="text-red-500">*</span>
                    </FieldLabel>
                    <select
                      {...field}
                      id="product-brand"
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
                      disabled={saving}
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                    >
                      <option value={0}>Select a brand</option>
                      {brands.data?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="selling_price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-selling_price">
                      Selling Price <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="product-selling_price"
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={saving}
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="stock_quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-stock_quantity">
                      Stock Quantity
                    </FieldLabel>
                    <Input
                      {...field}
                      id="product-stock_quantity"
                      type="number"
                      step="1"
                      min="0"
                      disabled={saving}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-type">Type</FieldLabel>
                    <select
                      {...field}
                      id="product-type"
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
                      disabled={saving}
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
                    <FieldLabel htmlFor="product-status">
                      Status <span className="text-red-500">*</span>
                    </FieldLabel>
                    <select
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ? "active" : "inactive"}
                      onChange={(event) =>
                        field.onChange(event.target.value === "active")
                      }
                      id="product-status"
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
                      disabled={saving}
                      aria-required="true"
                      aria-invalid={fieldState.invalid}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
