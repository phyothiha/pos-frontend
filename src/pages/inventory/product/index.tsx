import { Link, useSearchParams } from "react-router";
import { PlusIcon } from "lucide-react";
import { useProducts } from "@/features/products/queries";
import { Button, buttonVariants } from "@/components/ui/button";
import { TablePagination } from "@/components/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const { data, isPending, isError, refetch } = useProducts(page);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Products
        </h1>
        <Link to="/products/create" className={buttonVariants()}>
          <PlusIcon className="size-4" /> Add Product
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="text-right">Stock Quantity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell className="text-center" colSpan={9}>
                Loading products...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell className="text-center" colSpan={9}>
                Failed to load products.{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => void refetch()}
                >
                  Try again
                </Button>
              </TableCell>
            </TableRow>
          ) : data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9}>No products found.</TableCell>
            </TableRow>
          ) : (
            data.data.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category?.name ?? "—"}</TableCell>
                <TableCell>{product.brand?.name ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {Number(product.selling_price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {product.stock_quantity}
                </TableCell>
                <TableCell>
                  {product.type === "in_stock" ? "In Stock" : "Pre-Order"}
                </TableCell>
                <TableCell>
                  {product.is_active ? "Active" : "Inactive"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data && !isError && (
        <TablePagination
          currentPage={data.meta.current_page}
          lastPage={data.meta.last_page}
          onPageChange={(nextPage) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", String(nextPage));
            setSearchParams(params);
          }}
        />
      )}
    </div>
  );
}
