import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router";
import { ArrowLeftIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/features/invoices/schema";
import { useCreateInvoice } from "@/features/invoices/queries";
import { useAllPaymentPlatforms } from "@/features/payment-platforms/queries";
import type { Product } from "@/features/products/api";
import type { ApiValidationError } from "@/types/api";
import { ProductPicker } from "@/features/invoices/components/product-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm disabled:opacity-50";

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CreateInvoice() {
  const navigate = useNavigate();
  const create = useCreateInvoice();
  const platforms = useAllPaymentPlatforms();
  const [products, setProducts] = useState<Record<number, Product>>({});
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoice_date: today(),
      customer_name: "",
      customer_phone: "",
      delivery_phone: "",
      delivery_address: "",
      payment_type: "cod",
      payment_platform_id: 0,
      discount: 0,
      delivery_fee: 0,
      items: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const values = useWatch({ control: form.control });
  const subtotal = (values.items ?? []).reduce(
    (sum, item) =>
      sum +
      (products[item.product_id ?? 0]?.selling_price ?? 0) *
        (Number(item.quantity) || 0),
    0,
  );
  const total =
    subtotal -
    (Number(values.discount) || 0) +
    (Number(values.delivery_fee) || 0);
  const errors = form.formState.errors;

  function addProduct(product: Product) {
    if (!product.is_active || product.stock_quantity < 1) {
      toast.error("This product is no longer available to order.");
      return;
    }
    const index = form
      .getValues("items")
      .findIndex((item) => item.product_id === product.id);
    if (index >= 0) {
      toast.info("This product is already added. Change its quantity below.");
      return;
    }
    if (fields.length >= 100) return;
    setProducts((previous) => ({ ...previous, [product.id]: product }));
    append({ product_id: product.id, quantity: 1 });
    form.clearErrors("items");
  }

  async function onSubmit(data: InvoiceFormValues) {
    if (create.isPending) return;
    form.clearErrors();
    try {
      const invoice = await create.mutateAsync(data);
      toast.success("Invoice confirmed and available quantities updated.");
      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      if (isAxiosError<ApiValidationError>(error) && error.response?.status === 422) {
        const validationErrors = error.response.data.errors ?? {};
        for (const [key, messages] of Object.entries(validationErrors)) {
          if (key in invoiceFormSchema.shape || /^items\.\d+\.(product_id|quantity)$/.test(key)) {
            form.setError(key as FieldPath<InvoiceFormValues>, { type: "server", message: messages[0] });
          }
        }
        const message = Object.values(validationErrors).flat().join(" ") || error.response.data.message;
        form.setError("root", { type: "server", message });
        toast.error(message);
        return;
      }
      toast.error("Failed to create invoice. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Invoice
        </h1>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/invoices" />}
        >
          <ArrowLeftIcon />
          Back to Invoices
        </Button>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <fieldset disabled={create.isPending} className="space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold">Customer & Delivery</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(
                  [
                    ["customer_name", "Customer Name", "text", 150],
                    ["customer_phone", "Customer Phone", "tel", 30],
                    ["delivery_phone", "Delivery Phone", "tel", 30],
                    ["invoice_date", "Invoice Date", "date", undefined],
                  ] as const
                ).map(([name, label, type, maxLength]) => (
                  <Controller
                    key={name}
                    name={name}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={name}>{label} *</FieldLabel>
                        <Input
                          {...field}
                          id={name}
                          type={type}
                          maxLength={maxLength}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ))}
                <Controller
                  name="delivery_address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      className="md:col-span-2"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="delivery_address">
                        Delivery Address *
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="delivery_address"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold">Products</h2>
              <p className="text-sm text-muted-foreground">
                Available quantity limits apply to both in-stock and pre-order products.
              </p>
              <ProductPicker
                onSelect={addProduct}
                disabled={create.isPending || fields.length >= 100}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total (MMK)</TableHead>
                    <TableHead>
                      <span className="sr-only">Remove</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        Search and add products above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <p className="font-medium">
                            {products[field.product_id]?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {products[field.product_id]?.sku} ·{" "}
                            {products[field.product_id]?.type === "pre_order"
                              ? "Pre-Order"
                              : "In Stock"}
                            {` · Available: ${products[field.product_id]?.stock_quantity ?? 0}`}
                          </p>
                        </TableCell>
                        <TableCell>
                          {products[
                            field.product_id
                          ]?.selling_price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`items.${index}.quantity`}
                            control={form.control}
                            render={({ field: quantityField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input
                                  {...quantityField}
                                  value={
                                    Number.isNaN(quantityField.value) ? "" : quantityField.value
                                  }
                                  onChange={(event) =>
                                    quantityField.onChange(event.target.valueAsNumber)
                                  }
                                  aria-label={`Quantity for ${products[field.product_id]?.name}`}
                                  aria-invalid={fieldState.invalid}
                                  type="number"
                                  min={1}
                                  step={1}
                                  className="w-24"
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {(
                            (products[field.product_id]?.selling_price ?? 0) *
                            (Number(values.items?.[index]?.quantity) || 0)
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${products[field.product_id]?.name}`}
                            onClick={() => remove(index)}
                          >
                            <TrashIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <FieldError
                errors={[
                  errors.items?.root ??
                    (errors.items?.message
                      ? { message: errors.items.message }
                      : undefined),
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold">Payment & Totals</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="payment_type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="payment_type">Payment Type *</FieldLabel>
                      <select
                        {...field}
                        id="payment_type"
                        className={selectClass}
                        aria-invalid={fieldState.invalid}
                      >
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="paid">Paid</option>
                      </select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {values.payment_type === "paid" && (
                  <Controller
                    name="payment_platform_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="payment_platform_id">
                          Payment Platform *
                        </FieldLabel>
                        <select
                          {...field}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                          id="payment_platform_id"
                          className={selectClass}
                          disabled={platforms.isPending || platforms.isError}
                          aria-invalid={fieldState.invalid}
                        >
                          <option value={0}>Select a platform</option>
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
                          <p className="text-sm">Loading platforms...</p>
                        )}
                        {platforms.isError && (
                          <p role="alert" className="text-sm text-destructive">
                            Failed to load platforms.{" "}
                            <button
                              type="button"
                              className="underline"
                              onClick={() => platforms.refetch()}
                            >
                              Retry
                            </button>
                          </p>
                        )}
                        {platforms.data?.length === 0 && (
                          <p className="text-sm">
                            Add a platform on the{" "}
                            <Link className="underline" to="/payment-platforms">
                              Payment Platforms
                            </Link>{" "}
                            page.
                          </p>
                        )}
                      </Field>
                    )}
                  />
                )}
                {(
                  [
                    ["discount", "Discount (MMK)"],
                    ["delivery_fee", "Delivery Fee (MMK)"],
                  ] as const
                ).map(([name, label]) => (
                  <Controller
                    key={name}
                    name={name}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={name}>{label}</FieldLabel>
                        <Input
                          {...field}
                          value={Number.isNaN(field.value) ? "" : field.value}
                          onChange={(event) =>
                            field.onChange(event.target.valueAsNumber)
                          }
                          id={name}
                          type="number"
                          min={0}
                          step={1}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ))}
              </div>
              <dl className="ml-auto grid max-w-sm grid-cols-2 gap-2 border-t pt-4 text-sm">
                <dt>Subtotal</dt>
                <dd className="text-right">{subtotal.toLocaleString()} MMK</dd>
                <dt className="font-semibold">Grand Total</dt>
                <dd className="text-right font-semibold">
                  {total.toLocaleString()} MMK
                </dd>
              </dl>
            </CardContent>
          </Card>
        </fieldset>
        <FieldError errors={[errors.root]} />
        <div className="flex flex-wrap items-center justify-end gap-3">
          <p className="text-sm text-muted-foreground">
            Creating this invoice confirms the order and reduces available quantities.
          </p>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
