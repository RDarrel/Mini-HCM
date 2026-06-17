import CustomPagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SetShowOrderDetails } from "@/services/redux/slices/procurement/purchases";
import { Formatter, handlePagination } from "@/services/utilities";
import { capitalize } from "lodash";
import {
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import IncomingSkeleton from "./skeleton";

const statusMeta = {
  request: {
    label: "Requested",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
    icon: Clock,
  },
  incoming: {
    label: "Incoming",
    className: "border-accent/40 bg-accent/20 text-accent-foreground",
    icon: Truck,
  },
  redelivery: {
    label: "Re-delivery",
    className: "border-destructive/40 bg-destructive/10 text-foreground",
    icon: Truck,
  },
};

const IncomingOrdersTab = () => {
  const { filtered: orders, isLoading } = useSelector(
    ({ purchases }) => purchases,
  );
  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);
  const [openById, setOpenById] = useState({});
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);
  const dispatch = useDispatch();

  if (isLoading) {
    return <IncomingSkeleton />;
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No incoming orders
          </p>
          <p className="text-xs text-muted-foreground">
            Supplier requests and in-transit deliveries will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {handlePagination(rows, page, maxPage).map((purchase) => {
        const statusKey = String(purchase?.status || "pending").toLowerCase();
        const meta = statusMeta[statusKey] || statusMeta.pending;
        const StatusIcon = meta.icon || Clock;

        const purchaseId = String(purchase?._id || "");
        const isOpen = Boolean(openById[purchaseId]);
        const itemsCount =
          (Array.isArray(purchase?.orders) ? purchase.orders.length : 0) || 0;

        const items = Array.isArray(purchase?.items)
          ? purchase.items
          : Array.isArray(purchase?.orders)
            ? purchase.orders
            : [];

        const supplierName = purchase?.supplier?.name || "Supplier";

        const supplierContactRaw = purchase?.supplier?.contact?.mobile || "";
        const supplierContact = supplierContactRaw
          ? String(supplierContactRaw).trim()
          : "";
        const supplierContactHref = supplierContact
          ? `tel:${supplierContact.replace(/[^\d+]/g, "")}`
          : "";

        const deliveryFrom = purchase?.deliveryWindow?.from;
        const deliveryTo = purchase?.deliveryWindow?.to;
        const deliveryLabel =
          deliveryFrom && deliveryTo
            ? `${Formatter.date(deliveryFrom)} - ${Formatter.date(deliveryTo)}`
            : deliveryFrom
              ? Formatter.date(deliveryFrom)
              : "Not set";

        const canReceive = statusKey === "incoming";

        return (
          <div
            key={purchaseId || supplierName}
            className="rounded-xl border border-border bg-card/60 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-foreground">
                    {supplierName}
                  </p>
                  <Badge
                    variant="outline"
                    className={`rounded-full ${meta.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
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

              <div className="w-full sm:w-auto">
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

                  {canReceive ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 whitespace-nowrap px-3"
                      onClick={() => {
                        dispatch(SetShowOrderDetails(purchase));
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark received
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-background/40 p-3 text-sm">
              <Collapsible
                open={isOpen}
                onOpenChange={(next) =>
                  setOpenById((prev) => ({ ...prev, [purchaseId]: next }))
                }
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Delivery window
                      </p>
                      <p className="truncate font-semibold text-foreground">
                        {deliveryLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      {itemsCount ? (
                        <CollapsibleTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto w-full justify-start p-0 text-left hover:bg-transparent"
                          >
                            <span className="min-w-0">
                              <span className="block text-xs text-muted-foreground">
                                Items to deliver
                              </span>
                              <span className="flex min-w-0 items-center gap-1 font-semibold leading-none tabular-nums text-foreground">
                                <span className="truncate leading-none">
                                  {itemsCount} item(s)
                                </span>
                                <ChevronDown
                                  className={`h-4 w-4 mt-1 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                              </span>
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                      ) : (
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Items to deliver
                          </p>
                          <p className="truncate font-semibold tabular-nums text-foreground">
                            0 item(s)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Supplier contact
                      </p>
                      {supplierContact ? (
                        <a
                          href={supplierContactHref}
                          className="truncate font-medium text-foreground hover:underline"
                          title="Call supplier"
                        >
                          {supplierContact}
                        </a>
                      ) : (
                        <p className="truncate font-medium text-muted-foreground">
                          Not provided
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {itemsCount ? (
                  <CollapsibleContent className="mt-3">
                    {items.length ? (
                      <div className="overflow-hidden rounded-xl border border-border bg-card/40">
                        <div className="grid grid-cols-[1fr_170px_140px_160px] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">
                          <span>Item</span>
                          <span>Unit cost</span>
                          <span>Ordered Qty</span>
                          <span>Subtotal</span>
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          <div className="divide-y divide-border/70">
                            {items.map((item) => {
                              const incomingQty =
                                Number(item?.quantity?.incoming) || 0;
                              const unitCostRaw =
                                item?.cost ?? item?.inventory?.cost ?? 0;
                              const unitCost = Number(unitCostRaw);
                              const totalAmount = Number.isFinite(unitCost)
                                ? unitCost * Math.max(0, incomingQty)
                                : null;

                              return (
                                <div
                                  key={
                                    item?._id ||
                                    item?.inventory?._id ||
                                    item?.name
                                  }
                                  className="grid grid-cols-[1fr_170px_140px_160px] items-center gap-2 px-3 py-2 text-sm"
                                >
                                  <span className="truncate font-medium text-foreground">
                                    {item?.inventory?.name ||
                                      item?.name ||
                                      "Item"}
                                  </span>
                                  <span className="font-semibold tabular-nums text-foreground">
                                    {Number.isFinite(unitCost)
                                      ? `${Formatter.amount(unitCost)} / ${capitalize(item?.unit) || ""}`
                                      : "—"}
                                  </span>
                                  <span className="font-semibold tabular-nums text-foreground">
                                    {incomingQty}{" "}
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {capitalize(item?.unit) || ""}
                                    </span>
                                  </span>
                                  <span className="font-semibold tabular-nums text-foreground">
                                    {totalAmount === null
                                      ? "—"
                                      : Formatter.amount(totalAmount)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
                        Items for this order aren't available yet (UI-only for
                        now).
                      </div>
                    )}
                  </CollapsibleContent>
                ) : null}
              </Collapsible>
            </div>
          </div>
        );
      })}
      <CustomPagination
        title="Incoming order"
        datas={orders}
        page={page}
        maxPage={maxPage}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />
    </div>
  );
};

export default memo(IncomingOrdersTab);
