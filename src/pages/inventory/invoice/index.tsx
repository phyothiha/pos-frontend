import { Link, useSearchParams } from "react-router";
import { PlusIcon } from "lucide-react";
import { useInvoices } from "@/features/invoices/queries";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Invoices() {
  const [params, setParams] = useSearchParams();
  const requestedPage = Number(params.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const invoices = useInvoices(page);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Invoices
        </h1>
        <Button nativeButton={false} render={<Link to="/invoices/create" />}>
          <PlusIcon />
          Create Invoice
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead className="text-right">Total (MMK)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.isPending ? (
            <TableRow>
              <TableCell colSpan={8}>Loading invoices...</TableCell>
            </TableRow>
          ) : invoices.isError ? (
            <TableRow>
              <TableCell colSpan={8}>
                Failed to load invoices.{" "}
                <Button variant="link" onClick={() => invoices.refetch()}>
                  Retry
                </Button>
              </TableCell>
            </TableRow>
          ) : invoices.data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>No invoices found.</TableCell>
            </TableRow>
          ) : (
            invoices.data.data.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  <Link
                    className="hover:underline"
                    to={`/invoices/${invoice.id}`}
                  >
                    {invoice.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>{invoice.invoice_date}</TableCell>
                <TableCell>
                  <p>{invoice.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.customer_phone}
                  </p>
                </TableCell>
                <TableCell>
                  {invoice.payment_type === "cod" ? "COD" : "Paid"}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${invoice.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                  >
                    {invoice.payment_status === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`rounded-md px-2 py-1 text-xs capitalize ${invoice.status === "cancelled" ? "bg-red-100 text-red-800" : invoice.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {invoice.grand_total.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={<Link to={`/invoices/${invoice.id}`} />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {invoices.data && !invoices.isError && (
        <TablePagination
          currentPage={invoices.data.meta.current_page}
          lastPage={invoices.data.meta.last_page}
          onPageChange={(next) => {
            const updated = new URLSearchParams(params);
            updated.set("page", String(next));
            setParams(updated);
          }}
        />
      )}
    </div>
  );
}
