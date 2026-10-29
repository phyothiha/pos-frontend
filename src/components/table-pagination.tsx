import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  currentPage,
  lastPage,
  onPageChange,
}: TablePaginationProps) {
  return (
    <Pagination aria-label="Table pagination">
      <PaginationContent>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Go to previous page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeftIcon />
          </Button>
        </PaginationItem>
        <PaginationItem className="px-2 text-sm text-muted-foreground">
          Page {currentPage} of {lastPage}
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Go to next page"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRightIcon />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
