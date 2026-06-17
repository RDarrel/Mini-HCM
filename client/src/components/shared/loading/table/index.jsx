import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TableLoading = ({
  numberOfColumns = 4,
  className = "",
  paginationClassName = "",
}) => {
  const columns = new Array(numberOfColumns).fill("");
  return (
    <>
      <div
        className={cn(
          "rounded-md border border-border bg-card",
          className && className,
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((_, index) => (
                <TableHead
                  className={`${index === 0 ? "w-[100px]" : ""}`}
                  key={index}
                >
                  <Skeleton className="w-full h-6" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {new Array(5).fill("").map((_, index) => (
              <TableRow key={index}>
                {columns.map((_, index) => (
                  <TableCell
                    className={`${index === 0 ? "w-[100px]" : ""}`}
                    key={index}
                  >
                    <Skeleton className="w-full h-6" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div
        className={cn(
          "flex justify-between items-center mt-4",
          paginationClassName && paginationClassName
        )}
      >
        <div className="flex items-center gap-3 ml-2">
          <div>
            <Skeleton className="w-[9rem] h-5" />
          </div>
        </div>
        <div className="flex gap-9 items-center ">
          <div className="flex items-center gap-4">
            <Skeleton className="w-[6rem] h-5" />
            <Skeleton className="w-[4rem] h-7" />
          </div>
          <div>
            <Skeleton className="w-[5rem] h-5" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-[2.3rem] h-7" />
            <Skeleton className="w-[2.3rem] h-7" />
            <Skeleton className="w-[2.3rem] h-7" />
            <Skeleton className="w-[2.3rem] h-7" />
          </div>
        </div>
      </div>
    </>
  );
};

export default TableLoading;
