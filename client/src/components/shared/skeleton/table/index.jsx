import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const TableLoading = ({ numberOfRows = 5, numberOfColumns = 4 }) => {
  return (
    <>
      {Array.from({ length: numberOfRows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: numberOfColumns }).map((_, columnIndex) => (
            <TableCell key={columnIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableLoading;
