import { Link, useSearchParams } from "react-router";
import { isAxiosError } from "axios";
import { useInventoryMovements } from "@/features/inventory-movements/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/table-pagination";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export function InventoryMovements() {
  const [params, setParams] = useSearchParams();
  const requestedPage = Number(params.get("page") ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedProduct = Number(params.get("product_id"));
  const productId = Number.isSafeInteger(requestedProduct) && requestedProduct > 0 ? requestedProduct : undefined;
  const query = useInventoryMovements(page, productId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock History</h1>
        <p className="text-sm text-muted-foreground">
          Receipts, sales, cancellations and adjustments for available quantities.
        </p>
      </div>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get("product_id") ?? "").trim();
          setParams(value ? { product_id: value } : {});
        }}
      >
        <div className="space-y-1">
          <label htmlFor="history-product" className="text-sm font-medium">Product ID</label>
          <Input key={productId ?? "all"} id="history-product" name="product_id" type="number" min={1} step={1}
            defaultValue={productId ?? ""} placeholder="All products" className="w-40" />
        </div>
        <Button type="submit" variant="outline">Filter</Button>
        {productId && <Button type="button" variant="ghost" onClick={() => setParams({})}>Clear</Button>}
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Movement</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">Balance After</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isPending ? (
            <TableRow><TableCell colSpan={8}>Loading stock history...</TableCell></TableRow>
          ) : query.isError ? (
            <TableRow><TableCell colSpan={8}>
              {isAxiosError(query.error) && query.error.response?.status === 422
                ? "Select a valid product ID."
                : "Failed to load stock history."}
              <Button variant="link" onClick={() => query.refetch()}>Retry</Button>
            </TableCell></TableRow>
          ) : query.data.data.length === 0 ? (
            <TableRow><TableCell colSpan={8}>No stock movements found.</TableCell></TableRow>
          ) : query.data.data.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="whitespace-nowrap">{new Date(movement.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <p className="font-medium">{movement.product_name}</p>
                <p className="text-xs text-muted-foreground">#{movement.product_id} · {movement.product_sku}</p>
              </TableCell>
              <TableCell className="capitalize">{movement.type}</TableCell>
              <TableCell className={`text-right tabular-nums ${movement.quantity < 0 ? "text-destructive" : "text-green-700"}`}>
                {movement.quantity > 0 ? "+" : ""}{movement.quantity.toLocaleString()}
              </TableCell>
              <TableCell className="text-right tabular-nums">{movement.balance_after.toLocaleString()}</TableCell>
              <TableCell className="max-w-xs whitespace-normal">{movement.reason}</TableCell>
              <TableCell>{movement.user_name ?? "—"}</TableCell>
              <TableCell>{movement.invoice_id
                ? <Link className="underline" to={`/invoices/${movement.invoice_id}`}>View invoice #{movement.invoice_id}</Link>
                : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {query.data && !query.isError && (
        <TablePagination currentPage={query.data.meta.current_page} lastPage={query.data.meta.last_page}
          onPageChange={(next) => {
            const updated = new URLSearchParams(params);
            updated.set("page", String(next));
            setParams(updated);
          }} />
      )}
    </div>
  );
}
