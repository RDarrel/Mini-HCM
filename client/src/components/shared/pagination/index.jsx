import { Button } from "@/components/ui/button";
import RowsPerPage from "./rowsPerPage";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Pagination = ({
  pagination,
  title = "",
  titleExtension = "s",
  setPage = () => {},
  setLimit = () => {},
}) => {
  const { page, limit, totalPages, hasNextPage, hasPrevPage, totalRecords } =
    pagination;
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);

  return (
    <div
      className={cn(
        "mt-3 flex flex-col gap-4 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm text-gray-500">
          Showing {startRecord}-{endRecord} of {totalRecords}
          {` ${title}${totalRecords > 1 ? titleExtension : ""}`}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-5 lg:gap-10">
        <RowsPerPage maxPage={limit} setMaxPage={setLimit} />
        <div className="order-first sm:order-none">
          <p className="text-sm font-semibold">
            Page {page} of {totalPages}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            disabled={!hasPrevPage}
            className="hidden h-8 w-8 items-center justify-center lg:inline-flex"
            onClick={() => setPage(1)}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant={"outline"}
            className="h-8 w-8"
            disabled={!hasPrevPage}
            onClick={() => setPage(page === 1 ? page : page - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant={"outline"}
            className="h-8 w-8"
            disabled={!hasNextPage}
            onClick={() => setPage(page === totalPages ? page : page + 1)}
          >
            <ChevronRight />
          </Button>
          <Button
            variant={"outline"}
            className="hidden h-8 w-8 items-center justify-center lg:inline-flex"
            disabled={!hasNextPage}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
