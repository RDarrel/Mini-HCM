import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";

const ShortDeliveryItemsTable = ({ items }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
      <div className="grid grid-cols-[1.4fr_170px_140px_140px_160px_170px] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">
        <span>Item</span>
        <span className="text-right">Cost / Unit</span>
        <span className="text-right">Ordered Qty</span>
        <span className="text-right">Received Qty</span>
        <span className="text-right">Shortage Qty</span>
        <span className="text-right">Shortage Amount</span>
      </div>

      <div className="max-h-72 overflow-y-auto">
        <div className="divide-y divide-border/70">
          {(Array.isArray(items) ? items : []).map((item) => {
            const firstDelivery = Number(
              item?.quantity?.firstDelivery ?? item?.quantity?.received ?? 0,
            );
            const unitCostRaw = item?.cost ?? item?.inventory?.cost ?? 0;
            const unitCost = Number(unitCostRaw);
            const shortQty = Number(item?.quantity?.order ?? 0);

            const orderedQty =
              (Number.isFinite(firstDelivery) ? firstDelivery : 0) +
              (Number.isFinite(shortQty) ? shortQty : 0);
            const receivedQty =
              orderedQty - (Number.isFinite(shortQty) ? shortQty : 0);

            const totalAmount =
              Number.isFinite(unitCost) && Number.isFinite(shortQty)
                ? unitCost * Math.max(0, shortQty)
                : null;

            return (
              <div
                key={item?._id || item?.inventory?._id || item?.name}
                className="grid grid-cols-[1.4fr_170px_140px_140px_160px_170px] items-center gap-2 px-3 py-2 text-sm"
              >
                <span className="truncate font-medium text-foreground">
                  {item?.inventory?.name || item?.name || "Item"}
                </span>

                <span className="text-right font-semibold tabular-nums text-foreground">
                  {Number.isFinite(unitCost)
                    ? `${Formatter.amount(unitCost)} / ${capitalize(item?.unit) || ""}`
                    : "—"}
                </span>

                <span className="text-right font-semibold tabular-nums text-foreground">
                  {Number.isFinite(orderedQty) ? orderedQty : 0}{" "}
                  <span className="text-xs font-medium text-muted-foreground">
                    {capitalize(item?.unit) || ""}
                  </span>
                </span>

                <span className="text-right font-semibold tabular-nums text-foreground">
                  {Number.isFinite(receivedQty) ? receivedQty : 0}{" "}
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

                <span className="text-right font-semibold tabular-nums text-foreground">
                  {totalAmount === null ? "—" : Formatter.amount(totalAmount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShortDeliveryItemsTable;
