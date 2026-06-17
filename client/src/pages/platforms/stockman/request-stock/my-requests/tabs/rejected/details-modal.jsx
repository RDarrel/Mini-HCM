import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter, fullName } from "@/services/utilities";
import { capitalize } from "lodash";
import { memo, useMemo } from "react";

const DetailsModal = ({ open, onOpenChange, request }) => {
  const requestedByName = useMemo(() => {
    const requestedBy = request?.requestedBy;
    if (requestedBy && typeof requestedBy === "object") {
      return fullName(requestedBy?.fullName || requestedBy);
    }
    return String(requestedBy || "Unknown");
  }, [request]);

  const createdLabel = request?.createdAt
    ? Formatter.date(request.createdAt)
    : "-";
  const rejectedLabel = request?.admin?.reviewedAt
    ? Formatter.date(request.admin.reviewedAt)
    : "-";

  const reason = String(request?.admin?.note || "").trim();

  const items = useMemo(() => {
    return Array.isArray(request?.items) ? request.items : [];
  }, [request?.items]);

  return (
    <Dialog open={Boolean(open)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-1">
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto]">
          <div className="rounded-t-xl border-b border-border bg-card/70 px-5 py-4 pr-16">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="truncate text-lg">
                Rejected request details
              </DialogTitle>
              <DialogDescription className="text-sm leading-snug">
                Review the requested items and rejection reason.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-auto px-5 mt-4">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
                <div className="flex justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Date requested
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {createdLabel}
                    </p>
                  </div>
                  <div className="space-y-0.5 ">
                    <p className="text-xs font-medium text-muted-foreground">
                      Date rejected
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {rejectedLabel}
                    </p>
                  </div>
                  <div className="space-y-0.5 ">
                    <p className="text-xs font-medium text-muted-foreground">
                      Rejected Items
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {items.length} Items
                    </p>
                  </div>
                </div>

                {reason ? (
                  <div className="mt-3 rounded-lg border border-border/70 bg-background/40 px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Rejection reason
                    </p>
                    <p className="mt-1 text-sm text-foreground">{reason}</p>
                  </div>
                ) : null}
              </div>

              {items.length ? (
                <div className="overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-[200px]">
                          Available Stock
                        </TableHead>
                        <TableHead className="w-[200px]">
                          Requested Qty
                        </TableHead>
                        <TableHead className="w-[260px]">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => {
                        const key = String(
                          item?._id || item?.inventory?._id || index,
                        );
                        const name = item?.inventory?.name || "Item";
                        const qty = Number(item?.quantity?.request) || 0;
                        const unit = capitalize(item?.unit || "");
                        const remarks = String(item?.remarks || "").trim();

                        return (
                          <TableRow key={key}>
                            <TableCell className="whitespace-normal">
                              <p className="font-semibold text-foreground">
                                {name}
                              </p>
                            </TableCell>
                            <TableCell className="font-semibold tabular-nums text-foreground">
                              {item?.snapshot?.currentStock ?? 0}{" "}
                              <span className="text-xs font-medium text-muted-foreground">
                                {unit}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold tabular-nums text-foreground">
                              {qty}{" "}
                              <span className="text-xs font-medium text-muted-foreground">
                                {unit}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {remarks || "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      No items found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Items for this request aren&apos;t available.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-b-xl border-t border-border bg-card/70 px-5 py-4">
            <div className="flex items-center justify-end">
              <DialogFooter className="gap-2 sm:gap-0">
                <Separator className="hidden sm:block" orientation="vertical" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DetailsModal);
