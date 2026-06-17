import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Formatter } from "@/services/utilities";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ExternalLink,
  History,
  Package,
  UserRound,
} from "lucide-react";
import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateTime, formatReceivedBy } from "../utils";

const statusMeta = {
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

const ShortDeliverySection = ({ purchase, isOpen, onOpenChange }) => {
  const navigate = useNavigate();

  const { shortDeliveryHistory: history = [] } = useMemo(
    () => purchase || {},
    [purchase],
  );

  const isResolved = useMemo(() => {
    return history.some((record) => {
      const statusKey = String(record?.status || "").toLowerCase();

      if (statusKey === "refunded") return true;

      if (
        (statusKey === "resolve" || statusKey === "resolved") &&
        !record?.hasShortDelivery
      ) {
        return true;
      }

      return false;
    });
  }, [history]);

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="mt-4 p-3 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Received By</p>
              <p className="truncate font-semibold text-foreground">
                {formatReceivedBy(purchase?.received?.by)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start p-0 text-left hover:bg-transparent"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      Shortage History
                    </span>

                    <span className="flex min-w-0 items-center gap-1 font-semibold leading-none tabular-nums text-foreground">
                      <span className="truncate leading-none">
                        {history.length
                          ? `${history.length} record(s)`
                          : "No history"}
                      </span>

                      <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Shortage Status</p>
              <p className="truncate font-semibold text-foreground">
                {isResolved ? "Resolved" : "Unresolved"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CollapsibleContent className="mt-2">
        {history.length ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card/40">
            <div className="grid grid-cols-[minmax(170px,1fr)_minmax(170px,1fr)_minmax(140px,1fr)_minmax(170px,1fr)_minmax(120px,1fr)] gap-3 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              <span>Record</span>
              <span>Status</span>
              <span className="text-right">Items with Shortage</span>
              <span className="text-right">Shortage Value</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-border/70">
              {history.map((record, idx) => {
                const id = String(record?._id || idx);
                const statusKey = String(
                  record?.status || "review",
                ).toLowerCase();

                const meta = statusMeta[statusKey] || statusMeta.review;
                const shortItemsQty = Number(
                  record?.shortItemQty ??
                    record?.itemsCount ??
                    (Array.isArray(record?.orders)
                      ? record.orders.length
                      : 0) ??
                    0,
                );

                const amount = Number(record?.totalAmount ?? 0);
                const when = record?.updatedAt || record?.createdAt;

                const hasShortDelivery = Boolean(record?.hasShortDelivery);

                return (
                  <div
                    key={id}
                    className="grid grid-cols-[minmax(170px,1fr)_minmax(170px,1fr)_minmax(140px,1fr)_minmax(170px,1fr)_minmax(120px,1fr)] items-center gap-3 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {getRecordLabel(idx)}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {getRecordDescription(idx)}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {formatDateTime(when)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <Badge
                        variant="outline"
                        className={`rounded-full text-[11px] ${meta.className}`}
                      >
                        {record?.status === "resolved" &&
                        !record?.hasShortDelivery
                          ? "Resolved"
                          : meta.label}
                        {hasShortDelivery &&
                          statusKey === "resolved" &&
                          " (with shortage)"}
                      </Badge>
                    </div>

                    <div className="text-right font-semibold tabular-nums text-foreground">
                      {Number.isFinite(shortItemsQty) ? shortItemsQty : 0}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        item(s)
                      </span>
                    </div>

                    <div className="text-right font-semibold tabular-nums text-foreground">
                      {Formatter.amount(amount)}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() =>
                          navigate(
                            `/platforms/orders/Short-Deliveries?status=${encodeURIComponent(
                              statusKey,
                            )}&purchase=${encodeURIComponent(id)}`,
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
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
            No shortage history found for this order.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default memo(ShortDeliverySection);
