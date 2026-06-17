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
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter, fullName, isShortageResolved } from "@/services/utilities";
import { capitalize } from "lodash";
import { memo, useMemo, useState } from "react";
import { CircleAlert, CircleCheck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  formatQty,
  getItemsFromPurchase,
  getOrderedQty,
  getUnitCost,
  round2,
  toNumber,
} from "../../modal/utils";

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

const shortStatusMeta = {
  review: {
    label: "For Decision",
    className: "border-accent/40 bg-accent/20 text-accent-foreground",
  },
  redelivery: {
    label: "Waiting for Redelivery",
    className: "border-accent/40 bg-accent/20 text-accent-foreground",
  },
  resolved: {
    label: "Received",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
  },
  refunded: {
    label: "Refunded",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

const getRecordLabel = (index) => {
  if (index === 0) return "Initial Delivery";
  return `Redelivery-${index}`;
};

const getRecordDescription = (index) => {
  if (index === 0) return "Initial shortage from first delivery";
  return "Redelivery for previous shortage";
};

const DeliveredDetailsModal = ({ open, onOpenChange, purchase }) => {
  const navigate = useNavigate();
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
  const shortageResolved = useMemo(() => {
    if (!hasShortDelivery) return false;
    return shortHistory.some((record) => {
      const statusKey = String(record?.status || "").toLowerCase();
      if (statusKey === "refunded") return true;
      if (
        (statusKey === "resolve" || statusKey === "resolved") &&
        !record?.hasShortDelivery
      )
        return true;
      return false;
    });
  }, [hasShortDelivery, shortHistory]);
  const [historyOpen, setHistoryOpen] = useState(false);

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
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aOrdered = round2(getOrderedQty(a));
      const aReceived = round2(toNumber(a?.quantity?.received));
      const aShortQty = Math.max(0, round2(aOrdered - aReceived));

      const bOrdered = round2(getOrderedQty(b));
      const bReceived = round2(toNumber(b?.quantity?.received));
      const bShortQty = Math.max(0, round2(bOrdered - bReceived));

      // items with shortage first
      if (aShortQty > 0 && bShortQty === 0) return -1;
      if (aShortQty === 0 && bShortQty > 0) return 1;

      // optional: higher shortage quantity first
      return bShortQty - aShortQty;
    });
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
            className={`mt-4 grid gap-3 rounded-xl border border-border bg-muted/20 p-4 ${hasShortDelivery ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
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
            {hasShortDelivery ? (
              <div className="space-y-1">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                  Shortage status
                </p>
                <p
                  className={`text-sm font-semibold ${shortageResolved ? "text-secondary-foreground" : "text-accent-foreground"}`}
                >
                  {shortageResolved ? "Resolved" : "Unresolved"}
                </p>
              </div>
            ) : null}

            {purchase?.received?.note ? (
              <div className="sm:col-span-4 mt-3 rounded-lg border border-border/70 bg-background/40 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Remarks
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {purchase?.received?.note}
                </p>
              </div>
            ) : null}
          </div>

          {hasShortDelivery && shortHistory.length ? (
            <Collapsible
              open={historyOpen}
              onOpenChange={setHistoryOpen}
              className="mt-3"
            >
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                    Shortage history
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {shortHistory.length} record(s)
                  </p>
                </div>

                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    {historyOpen ? "Hide history" : "View history"}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="mt-2">
                <div className="overflow-hidden rounded-xl border border-border bg-card/60">
                  <div className="grid grid-cols-[minmax(140px,1fr)_minmax(170px,1fr)_minmax(140px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)] gap-3 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                    <span>Record</span>
                    <span>Status</span>
                    <span className="text-right">Items with Shortage</span>
                    <span className="text-right">Shortage value</span>
                    <span className="text-right">Action</span>
                  </div>
                  <div className="divide-y divide-border/70">
                    {shortHistory.map((record, index) => {
                      const id = String(record?._id || index);
                      const statusKey = String(
                        record?.status || "review",
                      ).toLowerCase();
                      const meta = shortStatusMeta[statusKey];
                      const shortItemsQty = Number(
                        record?.shortItemQty ??
                          record?.itemsCount ??
                          (Array.isArray(record?.orders)
                            ? record.orders.length
                            : 0) ??
                          0,
                      );
                      const amount = Number(record?.totalAmount ?? 0);

                      return (
                        <div
                          key={id}
                          className="grid grid-cols-[minmax(140px,1fr)_minmax(170px,1fr)_minmax(140px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)] items-center gap-3 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">
                              {getRecordLabel(index)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {getRecordDescription(index)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {formatDateTime(
                                record?.updatedAt || record?.createdAt,
                              )}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`rounded-full text-[11px] ${meta.className}`}
                              >
                                {record?.status === "resolved" &&
                                !record?.hasShortDelivery
                                  ? "Resolved"
                                  : meta.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-right font-semibold tabular-nums text-foreground">
                            {Number.isFinite(shortItemsQty) ? shortItemsQty : 0}{" "}
                            <span className="text-xs font-medium text-muted-foreground">
                              item(s)
                            </span>
                          </div>

                          <div className="text-right font-semibold tabular-nums text-foreground">
                            {Formatter.amount(
                              Number.isFinite(amount) ? amount : 0,
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 gap-2"
                              onClick={() =>
                                navigate(
                                  `/platforms/orders/Short-Deliveries?status=${encodeURIComponent(statusKey)}&purchase=${encodeURIComponent(id)}`,
                                )
                              }
                            >
                              View Details
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
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
                    {sortedItems.map((item) => {
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

                      const isResolved =
                        shortQty > 0
                          ? isShortageResolved(
                              item,
                              purchase?.shortDeliveryHistory,
                            )
                          : true;

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
                          <TableCell className="px-5 py-2.5 text-center">
                            {shortQty > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className="relative w-[140px]"
                                  title={isResolved ? "Resolved" : "Unresolved"}
                                >
                                  <Input
                                    type="text"
                                    value=""
                                    disabled
                                    className={`h-8 w-full border-dashed bg-muted/10 disabled:cursor-default disabled:opacity-100 ${
                                      shortQty > 0
                                        ? "border-destructive/40"
                                        : "border-border/70"
                                    }`}
                                  />

                                  {/* qty + unit */}
                                  <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                                    <span
                                      className={`text-sm font-semibold tabular-nums ${
                                        shortQty > 0
                                          ? "text-destructive"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {formatQty(shortQty)}
                                    </span>

                                    <span className="text-xs font-medium text-muted-foreground">
                                      {unit}
                                    </span>
                                  </div>

                                  {/* status icon */}
                                  {shortQty > 0 && (
                                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                                      {isResolved ? (
                                        <CircleCheck
                                          className="h-4 w-4 text-green-600"
                                          title="Resolved"
                                        />
                                      ) : (
                                        <CircleAlert
                                          className="h-4 w-4 text-destructive"
                                          title="Unresolved"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                                  <span className="font-medium">Amount</span>
                                  <span
                                    className={`font-semibold tabular-nums ${shortQty > 0 ? "text-destructive" : "text-muted-foreground"}`}
                                  >
                                    {shortAmount === null
                                      ? "-"
                                      : Formatter.amount(shortAmount)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="font-medium text-muted-foreground ">
                                —
                              </p>
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
