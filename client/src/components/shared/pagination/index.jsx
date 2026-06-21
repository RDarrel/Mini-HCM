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
  setMaxPage = () => {},
}) => {
  const { page, limit, totalPages, hasNextPage, hasPrevPage, totalRecords } =
    pagination;
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalRecords);
  return (
    <div className={cn("flex justify-between items-center mt-5")}>
      <div>
        <p className="text-gray-500 ml-2">
          Showing {startRecord}-{endRecord} of {totalRecords}
          {`${title}${totalRecords > 1 ? titleExtension : ""}`}
        </p>
      </div>
      <div className="flex items-center gap-10">
        <RowsPerPage maxPage={limit} setMaxPage={setMaxPage} />
        <div>
          <p className="font-semibold text-sm">
            Page {page} of {totalPages}
          </p>
        </div>
        <div className="flex">
          <Button
            variant={"outline"}
            disabled={hasPrevPage}
            className="w-8 h-8 mr-2 hidden lg:inline-flex items-center justify-center"
            onClick={() => setPage(1)}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant={"outline"}
            className=" w-8 mr-2 h-8"
            disabled={hasPrevPage}
            onClick={() => setPage(page === 1 ? page : page - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant={"outline"}
            className=" w-8 mr-2 h-8"
            disabled={hasNextPage}
            onClick={() => setPage(page === maxButtonCount ? page : page + 1)}
          >
            <ChevronRight />
          </Button>
          <Button
            variant={"outline"}
            className=" w-8 h-8 hidden lg:inline-flex items-center justify-center "
            disabled={hasNextPage}
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
