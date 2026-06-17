import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter, fullName } from "@/services/utilities";
import { LoaderCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { capitalize } from "lodash";
import { Badge } from "@/components/ui/badge";
const BatchesModalBody = () => {
  const { collections: stockMovements, isLoading } = useSelector(
    ({ stockMovements }) => stockMovements,
  );
  const tableColSpan = 6;

  const getMovementTypeBadgeClassName = (type) => {
    switch (type) {
      case "in":
        return "border-[color:color-mix(in_srgb,var(--chart-2)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--chart-2)_18%,var(--card))] text-[color:var(--chart-2)]";
      case "adjustment":
        return "border-[color:color-mix(in_srgb,var(--chart-4)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--chart-4)_18%,var(--card))] text-[color:var(--chart-4)]";
      case "waste":
        return "border-[color:color-mix(in_srgb,var(--destructive)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--destructive)_14%,var(--card))] text-[color:var(--destructive)]";
      case "out":
      default:
        return "border-[color:color-mix(in_srgb,var(--chart-1)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--chart-1)_16%,var(--card))] text-[color:var(--chart-1)]";
    }
  };

  const getMovementQtyClassName = (type) => {
    switch (type) {
      case "in":
        return "text-[color:var(--chart-2)]";
      case "adjustment":
        return "text-[color:var(--chart-4)]";
      case "waste":
        return "text-[color:var(--destructive)]";
      case "out":
      default:
        return "text-[color:var(--chart-1)]";
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-[7px] border border-border bg-card">
        <div className="max-h-[450px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/70">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Perform By</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={""}>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/40">
                        <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Loading Stock Movements
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please wait a moment...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : stockMovements.length ? (
                stockMovements.map((movement) => {
                  return (
                    <TableRow key={movement._id}>
                      <TableCell className="whitespace-normal">
                        {Formatter.date(movement.createdAt, true)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getMovementTypeBadgeClassName(movement.type)}
                        >
                          {capitalize(movement.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="  text-foreground">
                        {capitalize(movement.source)}
                      </TableCell>
                      <TableCell
                        className={`font-medium ${getMovementQtyClassName(
                          movement.type,
                        )}`}
                      >
                        {movement.type === "in" ? "+" : "-"} {movement.quantity}{" "}
                        {movement.unit}
                      </TableCell>
                      <TableCell className=" text-foreground">
                        {fullName(movement.createdBy?.fullName)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.remarks || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColSpan}
                    className="h-52 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-full border border-border bg-muted/40">
                        <LoaderCircle className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          No stock movements found
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Stock movement records will appear here once inventory
                          activity is recorded.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default BatchesModalBody;
