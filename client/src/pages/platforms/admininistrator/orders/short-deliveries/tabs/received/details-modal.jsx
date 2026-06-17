import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

import {
  formatQty,
  getItemsFromPurchase,
  getOrderedQty,
  getUnitCost,
  round2,
  toNumber,
} from "./utils";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatReceivedBy = (receivedBy) => {
  if (!receivedBy) return "—";
  if (typeof receivedBy === "string") return receivedBy.slice(-8);

  if (receivedBy?.fullName && typeof receivedBy.fullName === "object") {
    return fullName(receivedBy.fullName);
  }

  if (typeof receivedBy === "object" && receivedBy?.fname) {
    return fullName(receivedBy);
  }

  return (
    receivedBy?.name ||
    receivedBy?.username ||
    receivedBy?.email ||
    String(receivedBy?._id || "").slice(-8) ||
    "—"
  );
};

const DeliveredDetailsModal = ({ open, onOpenChange, purchase }) => {
  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);
  const shortHistory = useMemo(() => {
    const raw = Array.isArray(purchase?.shortDeliveryHistory)
      ? purchase.shortDeliveryHistory
      : [];
    return [...raw].sort((a, b) => {
      const ad = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const bd = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return ad - bd;
    });
  }, [purchase]);
  const hasShortDelivery = Boolean(purchase?.hasShortDelivery);
  const additionalReceivedAmount = useMemo(() => {
    if (!hasShortDelivery) return 0;
    return shortHistory.reduce((sum, record) => {
      const statusKey = String(record?.status || "").toLowerCase();
      if (!["resolved", "resolve"].includes(statusKey)) return sum;
      const amount = Number(record?.received?.amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [hasShortDelivery, shortHistory]);

  const supplierName =
    purchase?.supplier?.name ||
    purchase?.supplier?.company ||
    purchase?.supplier?.label ||
    "Supplier";

  const receivedAt =
    purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const unitCost = getUnitCost(item);
        const orderedQty = round2(getOrderedQty(item));
        const receivedQty = round2(toNumber(item?.quantity?.received));

        const orderedAmount =
          unitCost === null ? 0 : Math.max(0, orderedQty) * unitCost;
        const receivedAmount =
          unitCost === null ? 0 : Math.max(0, receivedQty) * unitCost;

        acc.ordered += orderedAmount;
        acc.received += receivedAmount;
        return acc;
      },
      { ordered: 0, received: 0 },
    );
  }, [items]);

  const totalReceivedAmount = totals.received + additionalReceivedAmount;
  const difference = totals.ordered - totalReceivedAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex  flex-col gap-0 p-0 sm:max-w-6xl">
        <DialogHeader className="space-y-0 px-6 pb-4 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-lg">
                  {hasShortDelivery
                    ? "Order details — Received with shortage"
                    : "Order details"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm leading-snug">
                View-only details for the delivered order.
              </DialogDescription>
            </div>
          </div>

          <div
            className={`mt-4 grid gap-3 rounded-xl border border-border bg-muted/20 p-4 ${hasShortDelivery ? "sm:grid-cols-3" : "sm:grid-cols-3"}`}
          >
            <div className="space-y-1">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                Supplier
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {supplierName}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                Received by
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {formatReceivedBy(purchase?.received?.by)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                Received date
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {formatDateTime(receivedAt)}
              </p>
            </div>
            {purchase?.received?.note ? (
              <div className="sm:col-span-3 mt-3 rounded-lg border border-border/70 bg-background/40 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Remarks
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {purchase?.received?.note}
                </p>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          <Separator />
          <div className="bg-muted/10 px-6 py-5">
            {!items.length ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-5 text-sm text-muted-foreground">
                No items found for this order.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <Table className="min-w-[980px]">
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-muted/30">
                      <TableHead className="px-5 text-[11px] font-semibold tracking-wide text-muted-foreground/90">
                        Item
                      </TableHead>
                      <TableHead className="px-5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground/90">
                        Ordered Qty
                      </TableHead>
                      <TableHead className="px-5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground/90">
                        Received Qty
                      </TableHead>

                      <TableHead className="px-5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground/90">
                        Shortage Qty
                      </TableHead>
                      <TableHead className="px-5 text-center text-[11px] font-semibold tracking-wide text-muted-foreground/90">
                        Expiration Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((item) => {
                      const name =
                        item?.inventory?.name || item?.name || "Item";
                      const unitRaw = String(item?.unit || "").trim();
                      const unit = capitalize(unitRaw) || "-";
                      const unitLabel = unitRaw ? unitRaw.toLowerCase() : "";
                      const unitCost = getUnitCost(item);
                      const ordered = round2(getOrderedQty(item));
                      const received = round2(
                        toNumber(item?.quantity?.received),
                      );
                      const shortQty = Math.max(0, round2(ordered - received));
                      const receivedAmount =
                        unitCost === null
                          ? null
                          : Math.max(0, received) * unitCost;
                      const shortAmount =
                        unitCost === null
                          ? null
                          : Math.max(0, shortQty) * unitCost;

                      return (
                        <TableRow
                          key={String(
                            item?._id ||
                              item?.inventory?._id ||
                              item?.inventory ||
                              item?.name,
                          )}
                          className="hover:bg-muted/5"
                        >
                          <TableCell className="whitespace-normal px-5 py-2.5 align-top">
                            <p className="truncate font-medium text-foreground">
                              {name}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                Unit cost:{" "}
                                <span className="font-medium text-foreground/80">
                                  {unitCost === null
                                    ? "-"
                                    : `${Formatter.amount(unitCost)}${unitLabel ? ` / ${capitalize(unitLabel)}` : ""}`}
                                </span>
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="px-5 py-2.5  text-right font-semibold tabular-nums text-foreground">
                            {formatQty(ordered)}{" "}
                            <span className="text-xs font-medium text-muted-foreground">
                              {unit}
                            </span>
                          </TableCell>

                          <TableCell className="px-5 py-2.5 align-top">
                            <div className="flex flex-col items-center gap-1">
                              <div className="relative w-[140px]">
                                <Input
                                  type="text"
                                  value={formatQty(received)}
                                  disabled
                                  className="h-8 w-full bg-background pr-12 text-right font-semibold tabular-nums disabled:cursor-default disabled:opacity-100"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                  {unit}
                                </span>
                              </div>
                              <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                                <span className="font-medium">Amount</span>
                                <span className="font-semibold tabular-nums text-foreground">
                                  {receivedAmount === null
                                    ? "-"
                                    : Formatter.amount(receivedAmount)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-2.5  text-center">
                            {shortQty > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="relative w-[140px]">
                                  <Input
                                    type="text"
                                    value={formatQty(shortQty)}
                                    disabled
                                    className={`h-8 w-full border-dashed bg-muted/10 pr-12 text-right font-semibold tabular-nums disabled:cursor-default disabled:opacity-100 ${shortQty > 0 ? "border-destructive/40 text-destructive" : "border-border/70 text-muted-foreground"}`}
                                  />
                                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                    {unit}
                                  </span>
                                </div>
                                <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                                  <span className="font-medium">Amount</span>
                                  <span
                                    className={`font-semibold tabular-nums ${shortQty > 0 ? "text-destructive" : "text-muted-foreground"}`}
                                  >
                                    {shortAmount === null
                                      ? "-"
                                      : Formatter.amount(shortAmount)}{" "}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="px-5 py-2.5 ">
                            <div className="mx-auto w-[150px]">
                              <p className="text-center  font-medium ">
                                {item?.inventory?.trackExpiration
                                  ? Formatter.date(item.expirationDate)
                                  : "—"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex flex-col gap-2 border-t border-border bg-muted/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex items-baseline justify-between gap-6 sm:justify-end">
                    <div className="text-right">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
                        Total Ordered
                      </span>
                      <div className="text-base font-semibold tabular-nums text-foreground">
                        {Formatter.amount(totals.ordered)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
                        Total Received
                      </span>
                      <div className="text-base font-semibold tabular-nums text-foreground">
                        {Formatter.amount(totalReceivedAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
                        Difference
                      </span>
                      <div
                        className={`text-base font-semibold tabular-nums ${difference === 0 ? "text-muted-foreground" : "text-destructive"}`}
                      >
                        {Formatter.amount(difference)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <DialogFooter className="px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DeliveredDetailsModal);
