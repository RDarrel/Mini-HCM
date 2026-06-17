import { Badge } from "@/components/ui/badge";
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
import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";
import { CalendarRange, CheckCircle2, Clock, XCircle } from "lucide-react";
import { memo, useMemo } from "react";

const statusMeta = {
  pending: {
    label: "Pending",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "border-emerald-500/30 bg-emerald-500/10 text-foreground",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Denied",
    className: "border-destructive/40 bg-destructive/10 text-foreground",
    icon: XCircle,
  },
};

const StockRequestDetailsModal = ({ open, onOpenChange, request }) => {
  const statusKey = String(request?.status || "pending").toLowerCase();
  const meta = statusMeta[statusKey] || statusMeta.pending;
  const StatusIcon = meta.icon || Clock;

  const createdAt = request?.createdAt || null;
  const createdLabel = createdAt ? Formatter.date(createdAt) : "-";

  const reviewedAt = request?.admin?.reviewedAt || null;
  const reviewedLabel = reviewedAt ? Formatter.date(reviewedAt) : null;

  const adminNote = String(request?.admin?.note || "").trim();

  const items = useMemo(() => {
    return Array.isArray(request?.items) ? request.items : [];
  }, [request?.items]);

  const totals = useMemo(() => {
    return { totalItems: items.length };
  }, [items]);

  return (
    <Dialog open={Boolean(open)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-1">
        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto]">
          <div className="rounded-t-xl border-b border-border bg-card/70 px-5 py-4 pr-16">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="truncate text-lg">
                      Stock request details
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className={`rounded-full ${meta.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                  </div>
                  <DialogDescription className="text-sm leading-snug">
                    Review your requested items and status updates.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-auto px-5 mt-4">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="inline-flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Date requested:
                      </span>
                      <span className="font-semibold text-foreground">
                        {createdLabel}
                      </span>
                    </div>

                    {reviewedLabel ? (
                      <div className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Date reviewed:
                        </span>
                        <span className="font-semibold text-foreground">
                          {reviewedLabel}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {adminNote ? (
                    <div className="text-xs text-muted-foreground">
                      Admin note:{" "}
                      <span className="font-medium text-foreground/90">
                        {adminNote}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {items.length ? (
                <div className="overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-[160px]">Requested</TableHead>
                        <TableHead className="w-[160px]">Approved</TableHead>
                        <TableHead className="w-[220px]">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const itemId = String(item?._id || "");
                        const invName = item?.inventory?.name || "Item";
                        const unit = capitalize(item?.unit || "");
                        const requestedQty =
                          Number(item?.quantity?.request) || 0;
                        const approvedQty =
                          Number(item?.quantity?.approved) || 0;
                        const remarks = String(item?.remarks || "").trim();

                        const currentStock = item?.snapshot?.currentStock;
                        const reorderLevel = item?.snapshot?.reorderLevel;
                        const snapshotLabel =
                          currentStock === undefined &&
                          reorderLevel === undefined
                            ? null
                            : `Stock: ${currentStock ?? 0} | Reorder: ${reorderLevel ?? 0}`;

                        return (
                          <TableRow
                            key={itemId || item?.inventory?._id || invName}
                          >
                            <TableCell className="whitespace-normal">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-foreground">
                                  {invName}
                                </p>
                                {snapshotLabel ? (
                                  <p className="text-xs text-muted-foreground">
                                    {snapshotLabel}
                                  </p>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold tabular-nums text-foreground">
                              {requestedQty}{" "}
                              <span className="text-xs font-medium text-muted-foreground">
                                {unit}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold tabular-nums text-foreground">
                              {approvedQty}{" "}
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                Total items:{" "}
                <span className="font-semibold text-foreground">
                  {totals.totalItems ?? 0}
                </span>
              </div>

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

export default memo(StockRequestDetailsModal);
