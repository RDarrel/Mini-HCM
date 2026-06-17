import CustomPagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Formatter, fullName, handlePagination } from "@/services/utilities";
import { OpenShortDeliveryActionModal } from "@/services/redux/slices/procurement/purchases";
import { capitalize } from "lodash";
import {
  ChevronDown,
  HandCoins,
  Package,
  PackageCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ShortDeliveriesSkeleton from "../skeleton";
import useHighlightPurchase from "../../use-highlight-purchase";

const getItemsFromPurchase = (purchase) => {
  if (!purchase) return [];
  const items = Array.isArray(purchase?.items)
    ? purchase.items
    : Array.isArray(purchase?.orders)
      ? purchase.orders
      : [];
  return Array.isArray(items) ? items : [];
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

const statusMeta = {
  review: {
    label: "Pending",
    className: "border-accent/40 bg-accent/20 text-accent-foreground",
  },
  redelivery: {
    label: "Pending",
    className: "border-accent/40 bg-accent/20 text-accent-foreground",
  },
};

const PendingShortDeliveriesTab = ({ highlightPurchaseId = null }) => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);
  const {
    filtered: orders,
    isLoading,
    formSubmitted,
  } = useSelector(({ purchases }) => purchases);
  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);
  const [openById, setOpenById] = useState({});
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);

  useHighlightPurchase({
    highlightPurchaseId,
    rows,
    page,
    pageSize: maxPage,
    setPage,
    setOpenById,
  });

  const handleShortAction = ({ purchase, type }) => {
    if (!purchase?._id) return;
    dispatch(OpenShortDeliveryActionModal({ purchase, type }));
  };

  if (isLoading) return <ShortDeliveriesSkeleton />;

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No pending short deliveries
          </p>
          <p className="text-xs text-muted-foreground">
            Short deliveries waiting for review will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {handlePagination(rows, page, maxPage).map((purchase) => {
        const statusKey = String(purchase?.status || "review").toLowerCase();
        const meta = statusMeta[statusKey] || statusMeta.review;

        const purchaseId = String(purchase?._id || "");
        const isOpen = Boolean(openById[purchaseId]);
        const items = getItemsFromPurchase(purchase);
        const itemsCount = Number(purchase?.itemsCount) || items.length;

        const supplierName =
          purchase?.supplier?.name ||
          purchase?.supplier?.company ||
          purchase?.supplier?.label ||
          "Supplier";

        const receivedAt =
          purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;

        return (
          <div
            key={purchase?._id || supplierName}
            id={`short-delivery-${purchaseId}`}
            className={`rounded-xl border border-border bg-card/60 p-4 shadow-sm ${highlightPurchaseId && String(highlightPurchaseId) === purchaseId ? "ring-2 ring-primary/40" : ""}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-foreground">
                    {supplierName}
                  </p>
                  <Badge
                    variant="outline"
                    className={`rounded-full ${meta.className}`}
                  >
                    <PackageCheck className="h-3 w-3" />
                    {meta.label}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  Address:{" "}
                  <span className="font-medium text-foreground/90">
                    {purchase?.supplier?.address
                      ? purchase.supplier.address
                      : "-"}
                  </span>
                </p>
              </div>

              <div className="w-full sm:ml-auto sm:w-auto">
                <div className="flex items-end justify-start gap-3 sm:justify-end">
                  <div className="flex flex-col items-start leading-none sm:items-end">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Total amount
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-foreground">
                      {Formatter.amount(purchase?.totalAmount || 0)}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-border/70" aria-hidden="true" />

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 whitespace-nowrap px-3"
                      disabled={!token || formSubmitted}
                      onClick={() =>
                        handleShortAction({
                          purchase,
                          type: "refunded",
                        })
                      }
                    >
                      <HandCoins className="h-4 w-4" />
                      Refund
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="h-8 whitespace-nowrap px-3"
                      disabled={!token || formSubmitted}
                      onClick={() =>
                        handleShortAction({
                          purchase,
                          type: "redelivery",
                        })
                      }
                    >
                      <Truck className="h-4 w-4" />
                      Redelivery
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {itemsCount ? (
              <Collapsible
                open={isOpen}
                onOpenChange={(next) =>
                  setOpenById((prev) => ({ ...prev, [purchaseId]: next }))
                }
              >
                <div className="mt-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Received by
                        </p>
                        <p className="truncate font-semibold text-foreground">
                          {formatReceivedBy(purchase?.received?.by)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <CollapsibleTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto w-full justify-start p-0 text-left hover:bg-transparent"
                          >
                            <span className="min-w-0">
                              <span className="block text-xs text-muted-foreground">
                                Items
                              </span>
                              <span className="flex min-w-0 items-center gap-1 font-semibold leading-none tabular-nums text-foreground">
                                <span className="truncate leading-none">
                                  {itemsCount} item(s)
                                </span>
                                <ChevronDown
                                  className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                              </span>
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Received date
                        </p>
                        <p className="truncate font-semibold text-foreground">
                          {formatDateTime(receivedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CollapsibleContent className="mt-3">
                  {items.length ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
                      <div className="grid grid-cols-[1fr_170px_140px_140px_140px_170px] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">
                        <span>Item</span>
                        <span className="text-right">Cost / Unit</span>
                        <span className="text-right">Ordered Qty</span>
                        <span className="text-right">Received Qty</span>
                        <span className="text-right">Shortage Qty</span>
                        <span className="text-right">Shortage Amount</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <div className="divide-y divide-border/70">
                          {handlePagination(items, page, maxPage).map(
                            (item) => {
                              const firstDelivery = Number(
                                item?.quantity?.firstDelivery ??
                                  item?.quantity?.received ??
                                  0,
                              );
                              const shortQty = Number(
                                item?.quantity?.order ?? 0,
                              );
                              const orderedQty =
                                (Number.isFinite(firstDelivery)
                                  ? firstDelivery
                                  : 0) +
                                (Number.isFinite(shortQty) ? shortQty : 0);
                              const receivedQty =
                                orderedQty -
                                (Number.isFinite(shortQty) ? shortQty : 0);
                              const unitCostRaw =
                                item?.cost ?? item?.inventory?.cost ?? 0;
                              const unitCost = Number(unitCostRaw);
                              const totalAmount = Number.isFinite(unitCost)
                                ? unitCost *
                                  (Number.isFinite(shortQty) ? shortQty : 0)
                                : null;

                              return (
                                <div
                                  key={
                                    item?._id ||
                                    item?.inventory?._id ||
                                    item?.name
                                  }
                                  className="grid grid-cols-[1fr_170px_140px_140px_140px_170px] items-center gap-2 px-3 py-2 text-sm"
                                >
                                  <span className="truncate font-medium text-foreground">
                                    {item?.inventory?.name ||
                                      item?.name ||
                                      "Item"}
                                  </span>
                                  <span className="text-right font-semibold tabular-nums text-foreground">
                                    {Number.isFinite(unitCost)
                                      ? `${Formatter.amount(unitCost)} / ${capitalize(item?.unit) || ""}`
                                      : "—"}
                                  </span>
                                  <span className="text-right font-semibold tabular-nums text-foreground">
                                    {Number.isFinite(orderedQty)
                                      ? orderedQty
                                      : 0}{" "}
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {capitalize(item?.unit) || ""}
                                    </span>
                                  </span>
                                  <span className="text-right font-semibold tabular-nums text-foreground">
                                    {Number.isFinite(receivedQty)
                                      ? receivedQty
                                      : 0}{" "}
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {capitalize(item?.unit) || ""}
                                    </span>
                                  </span>
                                  <span className="inline-flex items-center justify-end gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-0.5 text-right font-semibold tabular-nums text-destructive">
                                    {Number.isFinite(shortQty) ? shortQty : 0}
                                    <span className="text-xs font-medium text-destructive/80">
                                      {capitalize(item?.unit) || ""}
                                    </span>
                                  </span>
                                  <span className="text-right font-bold tabular-nums text-foreground">
                                    {totalAmount === null
                                      ? "—"
                                      : Formatter.amount(totalAmount)}
                                  </span>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
                      Items for this record aren&apos;t available yet.
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        );
      })}
      <CustomPagination
        title="Pending short delivery"
        datas={orders}
        page={page}
        maxPage={maxPage}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />
    </div>
  );
};

export default memo(PendingShortDeliveriesTab);
