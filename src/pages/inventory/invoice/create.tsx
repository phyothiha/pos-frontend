import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
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
      toast.success("Invoice created successfully.");
      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      const message =
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
          ? Object.values(error.response.data.errors ?? {})
              .flat()
              .join(" ")
          : "Failed to create invoice. Please try again.";
      toast.error(message);
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
                  <Field key={name} data-invalid={!!errors[name]}>
                    <FieldLabel htmlFor={name}>{label} *</FieldLabel>
                    <Input
                      {...form.register(name)}
                      id={name}
                      type={type}
                      maxLength={maxLength}
                      aria-invalid={!!errors[name]}
                    />
                    <FieldError errors={[errors[name]]} />
                  </Field>
                ))}
                <Field
                  className="md:col-span-2"
                  data-invalid={!!errors.delivery_address}
                >
                  <FieldLabel htmlFor="delivery_address">
                    Delivery Address *
                  </FieldLabel>
                  <Textarea
                    {...form.register("delivery_address")}
                    id="delivery_address"
                    aria-invalid={!!errors.delivery_address}
                  />
                  <FieldError errors={[errors.delivery_address]} />
                </Field>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-semibold">Products</h2>
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
                          </p>
                        </TableCell>
                        <TableCell>
                          {products[
                            field.product_id
                          ]?.selling_price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Input
                            aria-label={`Quantity for ${products[field.product_id]?.name}`}
                            type="number"
                            min={1}
                            step={1}
                            className="w-24"
                            {...form.register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                          <FieldError
                            errors={[errors.items?.[index]?.quantity]}
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
                <Field>
                  <FieldLabel htmlFor="payment_type">Payment Type *</FieldLabel>
                  <select
                    id="payment_type"
                    className={selectClass}
                    {...form.register("payment_type")}
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="paid">Paid</option>
                  </select>
                </Field>
                {values.payment_type === "paid" && (
                  <Field data-invalid={!!errors.payment_platform_id}>
                    <FieldLabel htmlFor="payment_platform_id">
                      Payment Platform *
                    </FieldLabel>
                    <select
                      id="payment_platform_id"
                      className={selectClass}
                      {...form.register("payment_platform_id", {
                        valueAsNumber: true,
                      })}
                      disabled={platforms.isPending || platforms.isError}
                    >
                      <option value={0}>Select a platform</option>
                      {platforms.data?.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                    <FieldError errors={[errors.payment_platform_id]} />
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
                {(
                  [
                    ["discount", "Discount (MMK)"],
                    ["delivery_fee", "Delivery Fee (MMK)"],
                  ] as const
                ).map(([name, label]) => (
                  <Field key={name} data-invalid={!!errors[name]}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>
                    <Input
                      id={name}
                      type="number"
                      min={0}
                      step={1}
                      {...form.register(name, { valueAsNumber: true })}
                    />
                    <FieldError errors={[errors[name]]} />
                  </Field>
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
        <div className="flex justify-end">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
