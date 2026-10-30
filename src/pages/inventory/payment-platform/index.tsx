import { useSearchParams } from "react-router";
import { usePaymentPlatforms } from "@/features/payment-platforms/queries";
import { AddPlatformDialog } from "@/features/payment-platforms/components/add-platform-dialog";
import { TablePagination } from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PaymentPlatforms() {
  const [params, setParams] = useSearchParams();
  const requestedPage = Number(params.get("page") ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const platforms = usePaymentPlatforms(page);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment Platforms
        </h1>
        <AddPlatformDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {platforms.isPending ? (
            <TableRow>
              <TableCell colSpan={2}>Loading payment platforms...</TableCell>
            </TableRow>
          ) : platforms.isError ? (
            <TableRow>
              <TableCell colSpan={2}>
                Failed to load payment platforms.{" "}
                <Button variant="link" onClick={() => platforms.refetch()}>
                  Retry
                </Button>
              </TableCell>
            </TableRow>
          ) : platforms.data.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2}>No payment platforms found.</TableCell>
            </TableRow>
          ) : (
            platforms.data.data.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell>{platform.id}</TableCell>
                <TableCell className="font-medium">{platform.name}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {platforms.data && !platforms.isError && (
        <TablePagination
          currentPage={platforms.data.meta.current_page}
          lastPage={platforms.data.meta.last_page}
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
