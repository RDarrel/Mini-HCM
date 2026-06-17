import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";
import { ChevronDown, Package, PackageCheck, UserRound } from "lucide-react";
import { memo, useMemo } from "react";
import {
  formatDateTime,
  formatReceivedBy,
  getItemsFromPurchase,
} from "../utils";

const ReceivedItemsSection = ({ purchase, isOpen, onOpenChange }) => {
  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);
  const itemsCount = Number(purchase?.itemsCount) || items.length;
  const receivedAt =
    purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;

  if (!itemsCount) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="mt-4 p-3 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Received by</p>
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
                      Items received
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
              <p className="text-xs text-muted-foreground">Received date</p>
              <p className="truncate font-semibold text-foreground">
                {formatDateTime(receivedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CollapsibleContent className="mt-2">
        {items.length ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card/40">
            <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              <span>Item</span>
              <span>Ordered Qty</span>
              <span>Received Qty</span>
              <span>Expiration Date</span>
            </div>
            <div className="max-h-56 overflow-y-auto">
              <div className="divide-y divide-border/70">
                {items.map((item) => {
                  const orderedQty = Number(item?.quantity?.incoming ?? 0);
                  const receivedQty = Number(item?.quantity?.received ?? 0);

                  return (
                    <div
                      key={String(
                        item?._id || item?.inventory?._id || item?.name,
                      )}
                      className="grid grid-cols-[1fr_150px_150px_150px] items-center gap-2 px-3 py-2 text-sm"
                    >
                      <span className="truncate font-medium text-foreground">
                        {item?.inventory?.name || item?.name || "Item"}
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {Number.isFinite(orderedQty) ? orderedQty : 0}{" "}
                        <span className="text-xs font-medium text-muted-foreground">
                          {capitalize(item?.unit) || ""}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {Number.isFinite(receivedQty) ? receivedQty : 0}{" "}
                        <span className="text-xs font-medium text-muted-foreground">
                          {capitalize(item?.unit) || ""}
                        </span>
                      </span>

                      <span className="text-xs font-medium text-muted-foreground">
                        {item?.expirationDate
                          ? Formatter.date(item.expirationDate)
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
            Items for this order aren&apos;t available yet (older orders may
            have been created before item tracking was added).
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default memo(ReceivedItemsSection);
