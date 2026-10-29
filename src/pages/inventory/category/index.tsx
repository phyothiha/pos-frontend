import { useCategories } from "@/features/categories/queries";
import { AddCategoryDialog } from "@/features/categories/components/add-category-dialog";
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

export function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const { data, isPending, isError } = useCategories(page);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddCategoryDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell className="text-center" colSpan={2}>
                Loading categories...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell className="text-center" colSpan={2}>
                Failed to load categories.
              </TableCell>
            </TableRow>
          ) : data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2}>No categories found.</TableCell>
            </TableRow>
          ) : (
            data.data.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
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
