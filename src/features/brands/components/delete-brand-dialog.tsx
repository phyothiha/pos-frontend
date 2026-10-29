import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Brand } from "@/features/brands/api";
import { useDeleteBrand } from "@/features/brands/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteBrandDialog({
  brand,
  onDeleted,
}: {
  brand: Brand;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const deleteBrand = useDeleteBrand();

  function handleOpenChange(isOpen: boolean) {
    if (deleteBrand.isPending) return;
    setOpen(isOpen);
  }

  async function handleDelete() {
    try {
      await deleteBrand.mutateAsync(brand.id);
      setOpen(false);
      toast.success("Brand deleted successfully.");
      onDeleted();
    } catch {
      toast.error("Failed to delete brand. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogTrigger
        render={<Button type="button" variant="destructive" size="sm" />}
      >
        <Trash2Icon />
        Delete
      </DialogTrigger>
      <DialogContent showCloseButton={!deleteBrand.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Brand</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{brand.name}"? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={deleteBrand.isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteBrand.isPending}
            onClick={handleDelete}
          >
            {deleteBrand.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
