import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Formatter } from "@/services/utilities";
import { memo, useMemo } from "react";
import { PackageCheck } from "lucide-react";
import { getItemsFromPurchase, getPurchaseMeta, getTotals } from "../utils";
import ReceivedItemsSection from "./received-items";
import ShortDeliverySection from "./short-delivery";

const getAdditionalReceivedFromResolvedHistory = (purchase) => {
  const history = Array.isArray(purchase?.shortDeliveryHistory)
    ? purchase.shortDeliveryHistory
    : [];

  return history.reduce((sum, record) => {
    const statusKey = String(record?.status || "").toLowerCase();
    if (!["resolved", "resolve"].includes(statusKey)) return sum;
    const amount = Number(record?.received?.amount ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
};

const DeliveredOrderCard = ({
  purchase,
  isOpen,
  onOpenChange,
  onViewDetails,
}) => {
  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);
  const itemsCount = Number(purchase?.itemsCount) || items.length;
  const { meta, supplierName } = useMemo(
    () => getPurchaseMeta(purchase),
    [purchase],
  );
  const totals = useMemo(() => getTotals(items), [items]);
  const hasShortDelivery = Boolean(purchase?.hasShortDelivery);
  const additionalReceived = useMemo(
    () =>
      hasShortDelivery ? getAdditionalReceivedFromResolvedHistory(purchase) : 0,
    [hasShortDelivery, purchase],
  );

  const totalReceived = totals.received + additionalReceived;
  const difference = totals.ordered - totalReceived;
  const mainStatusLabel =
    hasShortDelivery && meta?.label === "Received"
      ? "Received with Shortage"
      : meta?.label || "";

  if (!itemsCount && !hasShortDelivery) return null;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
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
              {mainStatusLabel}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Address:{" "}
            <span className="font-medium text-foreground/90">
              {purchase?.supplier?.address ? purchase.supplier.address : "-"}
            </span>
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:flex-row sm:items-end sm:justify-end">
          <div className="grid gap-3 sm:flex sm:items-end sm:justify-end sm:divide-x sm:divide-border/70 sm:text-right">
            <div className="flex flex-col items-start gap-1 sm:items-end sm:px-4 sm:pl-0">
              <p className="text-xs text-muted-foreground">Total ordered</p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                {Formatter.amount(totals.ordered)}
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end sm:px-4">
              <p className="text-xs text-muted-foreground">Total received</p>
              <p className="text-base font-semibold tabular-nums text-foreground">
                {Formatter.amount(totalReceived)}
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end sm:px-4 sm:pr-0">
              <p className="text-xs text-muted-foreground">Difference</p>
              <p
                className={`text-base font-semibold tabular-nums ${difference === 0 ? "text-muted-foreground" : "text-destructive"}`}
              >
                {Formatter.amount(difference)}
              </p>
            </div>
          </div>

          <div className="hidden h-10 w-px self-center bg-border/70 sm:block" />

          <Button
            type="button"
            size="sm"
            className="h-9 gap-2 bg-primary px-3 text-primary-foreground hover:bg-primary/90 sm:ml-2"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>

      {hasShortDelivery ? (
        <ShortDeliverySection
          purchase={purchase}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      ) : (
        <ReceivedItemsSection
          purchase={purchase}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        />
      )}
    </div>
  );
};

export default memo(DeliveredOrderCard);
