import { Link, useParams } from "react-router";
import { isAxiosError } from "axios";
import { ArrowLeftIcon } from "lucide-react";
import { useInvoice } from "@/features/invoices/queries";
import { CollectPaymentDialog } from "@/features/invoices/components/collect-payment-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InvoiceDetails() {
  const { id } = useParams();
  const invoiceId = Number(id);
  const query = useInvoice(invoiceId);
  if (!Number.isSafeInteger(invoiceId) || invoiceId < 1)
    return <p>Invoice not found.</p>;
  if (query.isPending) return <p>Loading invoice...</p>;
  if (query.isError)
    return (
      <div className="space-y-4">
        <p role="alert">
          {isAxiosError(query.error) && query.error.response?.status === 404
            ? "Invoice not found."
            : "Failed to load invoice."}
        </p>
        <Button variant="outline" onClick={() => query.refetch()}>
          Retry
        </Button>
        <Button
          nativeButton={false}
          variant="link"
          render={<Link to="/invoices" />}
        >
          Back to Invoices
        </Button>
      </div>
    );
  const invoice = query.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="break-all text-2xl font-semibold tracking-tight">
            {invoice.invoice_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {invoice.invoice_date}
          </p>
        </div>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/invoices" />}
        >
          <ArrowLeftIcon />
          Back to Invoices
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-semibold">Customer & Delivery</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Customer</dt>
              <dd>{invoice.customer_name}</dd>
              <dt className="text-muted-foreground">Customer Phone</dt>
              <dd>{invoice.customer_phone}</dd>
              <dt className="text-muted-foreground">Delivery Phone</dt>
              <dd>{invoice.delivery_phone}</dd>
              <dt className="text-muted-foreground">Address</dt>
              <dd className="whitespace-pre-wrap break-words">
                {invoice.delivery_address}
              </dd>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-semibold">Payment & Status</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Payment Type</dt>
              <dd>
                {invoice.payment_type === "cod"
                  ? "Cash on Delivery (COD)"
                  : "Paid"}
              </dd>
              <dt className="text-muted-foreground">Payment Status</dt>
              <dd className="font-medium">
                {invoice.payment_status === "paid" ? "Paid" : "Unpaid"}
              </dd>
              <dt className="text-muted-foreground">Payment Platform</dt>
              <dd>
                {invoice.payment_platform?.name ??
                  (invoice.payment_status === "paid" &&
                  invoice.payment_type === "cod"
                    ? "Cash"
                    : "—")}
              </dd>
              <dt className="text-muted-foreground">Order Status</dt>
              <dd className="capitalize">{invoice.status}</dd>
              <dt className="text-muted-foreground">Delivery Status</dt>
              <dd className="capitalize">
                {invoice.delivery_status.replaceAll("_", " ")}
              </dd>
            </dl>
            {invoice.payment_status === "unpaid" &&
              invoice.status !== "cancelled" && (
                <CollectPaymentDialog invoice={invoice} />
              )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="space-y-4">
          <h2 className="font-semibold">Products</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Unit Price (MMK)</TableHead>
                <TableHead className="text-right">Total (MMK)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product_sku}
                    </p>
                  </TableCell>
                  <TableCell>
                    {item.product_type === "pre_order"
                      ? "Pre-Order"
                      : "In Stock"}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {item.unit_price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.line_total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <dl className="ml-auto grid max-w-sm grid-cols-2 gap-2 border-t pt-4 text-sm">
            <dt>Subtotal</dt>
            <dd className="text-right">
              {invoice.subtotal.toLocaleString()} MMK
            </dd>
            <dt>Discount</dt>
            <dd className="text-right">
              {invoice.discount.toLocaleString()} MMK
            </dd>
            <dt>Delivery Fee</dt>
            <dd className="text-right">
              {invoice.delivery_fee.toLocaleString()} MMK
            </dd>
            <dt className="font-semibold">Grand Total</dt>
            <dd className="text-right font-semibold">
              {invoice.grand_total.toLocaleString()} MMK
            </dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
