import { Formatter, Inventory, Stock } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CartRemove,
  CartUpdate,
} from "@/services/redux/slices/procurement/purchases";
import { Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { memo, useMemo } from "react";

const ReviewOrderItemsList = ({ rows = [], draftQtyById, setDraftQtyById }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="space-y-2">
      {safeRows.length ? (
        <div className="hidden grid-cols-[1fr_110px_130px_130px_120px] gap-2 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80 sm:grid">
          <span>Item</span>
          <span>Unit cost</span>
          <span>Available stock</span>
          <span className="text-center">Order Quantity</span>
          <span className="text-right">Subtotal</span>
        </div>
      ) : null}
      {safeRows.map((item, idx) => (
        <ItemRaw
          key={item?.inventory?._id || idx}
          item={item}
          draftQtyById={draftQtyById}
          setDraftQtyById={setDraftQtyById}
        />
      ))}
    </div>
  );
};

export default ReviewOrderItemsList;

const ItemRaw = memo(({ item, draftQtyById, setDraftQtyById }) => {
  const { cost: unitCost, quantity: qty, inventory } = item;

  const { unit, subtotal } = useMemo(() => {
    const unit = Inventory.getUnitByMeasurement(inventory?.measurement) || "";
    const subtotal =
      (Number(unitCost) || 0) *
      (Number(draftQtyById[inventory?._id] ?? qty) || 0);
    return { unit, subtotal };
  }, [inventory, unitCost, qty, draftQtyById]);
  const dispatch = useDispatch();
  return (
    <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background/30 px-3 py-3 text-sm shadow-sm transition-colors hover:bg-background/40 sm:grid-cols-[1fr_110px_130px_130px_120px] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">
          {inventory?.name || "Item"}
        </p>
      </div>

      <div className="flex items-baseline justify-between gap-2 sm:block">
        <span className="text-xs text-muted-foreground sm:hidden">
          Unit cost
        </span>
        <p className="font-medium tabular-nums text-foreground">
          {Formatter.amount(unitCost)}{" "}
          <span className="text-xs text-muted-foreground">/ {unit || "—"}</span>
        </p>
      </div>

      <div className="flex items-baseline justify-between gap-2 sm:block">
        <span className="text-xs text-muted-foreground sm:hidden">
          Unit cost
        </span>
        <p className="font-medium tabular-nums text-foreground">
          {Stock.format(inventory?.stockDisplay?.current)}{" "}
          <span className="text-xs text-muted-foreground">{unit || "—"}</span>
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-start">
        <span className="text-xs text-muted-foreground sm:hidden">Qty</span>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            value={draftQtyById?.[inventory?._id] ?? qty}
            required
            onChange={(event) => {
              let value = event.target.value;

              setDraftQtyById((prev) => ({
                ...prev,
                [inventory?._id]: Inventory.sanitizeQtyInp(
                  inventory?.measurement,
                  value,
                ),
              }));
            }}
            onBlur={() => {
              const nextQty = Math.max(
                0,
                Number(draftQtyById[inventory?._id] ?? qty) || 0,
              );
              dispatch(
                CartUpdate({
                  inventory,
                  quantity: nextQty,
                }),
              );
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            className="h-9 w-24 rounded-md bg-background text-center text-sm tabular-nums shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:w-24"
          />
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end sm:text-right">
        <span className="text-xs text-muted-foreground sm:hidden">
          Subtotal
        </span>
        <div className="flex items-center gap-2 sm:justify-end">
          <p className="font-semibold text-foreground tabular-nums">
            {Formatter.amount(subtotal)}
          </p>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-destructive hover:text-destructive"
            onClick={() => dispatch(CartRemove(inventory?._id))}
            aria-label={`Remove ${inventory?.name || "item"}`}
            title="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
