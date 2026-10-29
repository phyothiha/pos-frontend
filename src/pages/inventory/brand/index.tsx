import { useBrands } from "@/features/brands/queries";
import { AddBrandDialog } from "@/features/brands/components/add-brand-dialog";
import { EditBrandDialog } from "@/features/brands/components/edit-brand-dialog";
import { DeleteBrandDialog } from "@/features/brands/components/delete-brand-dialog";
import { useSearchParams } from "react-router";
import { TablePagination } from "@/components/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Brands() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const { data, isPending, isError } = useBrands(page);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Manage Brands</h1>
        <AddBrandDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell className="text-center" colSpan={3}>
                Loading brands...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell className="text-center" colSpan={3}>
                Failed to load brands.
              </TableCell>
            </TableRow>
          ) : data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3}>No brands found.</TableCell>
            </TableRow>
          ) : (
            data.data.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <EditBrandDialog brand={brand} />
                    <DeleteBrandDialog
                      brand={brand}
                      onDeleted={() => {
                        if (data.data.length === 1 && page > 1) {
                          const params = new URLSearchParams(searchParams);
                          params.set("page", String(page - 1));
                          setSearchParams(params);
                        }
                      }}
                    />
                  </div>
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
          onPageChange={(page) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", String(page));
            setSearchParams(params);
          }}
        />
      )}
    </div>
  );
}
