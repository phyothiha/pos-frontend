import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Category } from "@/features/categories/api";
import { useDeleteCategory } from "@/features/categories/queries";
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

export function DeleteCategoryDialog({
  category,
  onDeleted,
}: {
  category: Category;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const deleteCategory = useDeleteCategory();

  function handleOpenChange(isOpen: boolean) {
    if (deleteCategory.isPending) return;
    setOpen(isOpen);
  }

  async function handleDelete() {
    try {
      await deleteCategory.mutateAsync(category.id);
      setOpen(false);
      toast.success("Category deleted successfully.");
      onDeleted();
    } catch {
      toast.error("Failed to delete category. Please try again.");
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
      <DialogContent showCloseButton={!deleteCategory.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{category.name}"? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={deleteCategory.isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteCategory.isPending}
            onClick={handleDelete}
          >
            {deleteCategory.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
