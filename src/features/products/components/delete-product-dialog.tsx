import { useState } from "react";
import { isAxiosError } from "axios";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/features/products/api";
import { useDeleteProduct } from "@/features/products/queries";
import type { ApiValidationError } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteProductDialog({
  product,
  onDeleted,
}: {
  product: Product;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const remove = useDeleteProduct();
  function changeOpen(value: boolean) {
    if (remove.isPending) return;
    setOpen(value);
    setError("");
  }
  async function submit() {
    if (remove.isPending) return;
    setError("");
    try {
      await remove.mutateAsync(product.id);
      setOpen(false);
      toast.success("Product deleted successfully.");
      onDeleted();
    } catch (error) {
      setError(
        isAxiosError<ApiValidationError>(error) &&
          error.response?.status === 422
          ? Object.values(error.response.data.errors ?? {})
              .flat()
              .join(" ") || error.response.data.message
          : "Failed to delete product. Please try again.",
      );
    }
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen} disablePointerDismissal>
      <DialogTrigger
        render={<Button type="button" variant="destructive" size="sm" />}
      >
        <Trash2Icon />
        Delete
      </DialogTrigger>
      <DialogContent showCloseButton={!remove.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{product.name}"? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={remove.isPending}
            onClick={() => changeOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={remove.isPending}
            onClick={submit}
          >
            {remove.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
