import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { memo, useMemo } from "react";
import { PackageCheck } from "lucide-react";
import { getItemsFromPurchase, getPurchaseMeta } from "../utils";
import ReceivedItemsSection from "./received-items";
import ShortDeliverySection from "./short-delivery";

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
  const hasShortDelivery = Boolean(purchase?.hasShortDelivery);

  const shortageItemsCount = useMemo(() => {
    return items.reduce((count, item) => {
      const incomingQty = Number(item?.quantity?.incoming) || 0;
      const orderedQty = Number(item?.quantity?.received) || 0;

      return incomingQty !== orderedQty ? count + 1 : count;
    }, 0);
  }, [items]);

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
          {shortageItemsCount > 0 && (
            <>
              <div className="grid gap-3 sm:flex sm:items-end sm:justify-end sm:divide-x sm:divide-border/70 sm:text-right">
                <div className="flex flex-col items-start gap-1 sm:items-end sm:px-4 sm:pl-0">
                  <p className="text-xs text-muted-foreground">Total items</p>
                  <p className="text-base font-semibold tabular-nums text-foreground">
                    {itemsCount}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end sm:px-4">
                  <p className="text-xs text-muted-foreground">
                    Items with Shortage
                  </p>
                  <p className="text-base font-semibold tabular-nums text-foreground">
                    {shortageItemsCount}
                  </p>
                </div>
              </div>

              <div className="hidden h-10 w-px self-center bg-border/70 sm:block" />
            </>
          )}

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
