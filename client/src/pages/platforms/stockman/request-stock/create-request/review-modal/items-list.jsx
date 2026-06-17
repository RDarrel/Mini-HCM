import { Inventory, Stock } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CartRemove,
  CartUpdate,
} from "@/services/redux/slices/procurement/stock-requests";
import { Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { memo, useMemo } from "react";
import { capitalize } from "lodash";

const ReviewOrderItemsList = ({
  rows = [],
  draftQtyById,
  setDraftQtyById,
  draftRemarksById,
  setDraftRemarksById,
}) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="space-y-2">
      {safeRows.length ? (
        <div className="hidden grid-cols-[1fr_140px_120px_160px_40px] gap-2 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80 sm:grid">
          <span>Item</span>
          <span>Available Stock</span>
          <span>Status</span>
          <span className="text-center">Request qty</span>
          <span />
        </div>
      ) : null}

      {safeRows.map((item, idx) => (
        <ItemRaw
          key={item?.inventory?._id || idx}
          item={item}
          draftQtyById={draftQtyById}
          setDraftQtyById={setDraftQtyById}
          draftRemarksById={draftRemarksById}
          setDraftRemarksById={setDraftRemarksById}
        />
      ))}
    </div>
  );
};

export default ReviewOrderItemsList;

const ItemRaw = memo(
  ({
    item,
    draftQtyById,
    setDraftQtyById,
    draftRemarksById,
    setDraftRemarksById,
  }) => {
    const { quantity: qty, inventory, remarks } = item || {};
    const dispatch = useDispatch();

    const unit = useMemo(() => {
      return Inventory.getUnitByMeasurement(inventory?.measurement) || "";
    }, [inventory]);

    const stockStatus = String(inventory?.stockStatus || "").trim();
    const stockStatusLabel = stockStatus ? capitalize(stockStatus) : "";

    const stockStatusTone = useMemo(() => {
      const normalized = stockStatus.toLowerCase();
      if (normalized === "out of stock")
        return "border-destructive/20 bg-destructive/10 text-destructive";
      if (normalized === "low stock")
        return "border-amber-500/20 bg-amber-500/10 text-amber-800";
      if (normalized === "in stock")
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-800";
      return "border-border/40 bg-muted/40 text-muted-foreground";
    }, [stockStatus]);

    return (
      <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background/30 px-3 py-3 text-sm shadow-sm transition-colors hover:bg-background/40 sm:grid-cols-[1fr_140px_120px_160px_40px] sm:items-center">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {inventory?.name || "Item"}
          </p>
          <Input
            value={draftRemarksById?.[inventory?._id] ?? remarks ?? ""}
            onChange={(event) => {
              setDraftRemarksById?.((prev) => ({
                ...(prev || {}),
                [inventory?._id]: event.target.value,
              }));
            }}
            onBlur={() => {
              const nextRemarks = String(
                draftRemarksById?.[inventory?._id] ?? remarks ?? "",
              ).trim();
              dispatch(CartUpdate({ inventory, remarks: nextRemarks }));
            }}
            placeholder="Remarks (optional)"
            className="mt-2 h-8"
          />
        </div>

        <div className="flex items-baseline justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">
            Current stock
          </span>
          <p className="font-medium tabular-nums text-foreground">
            {Stock.display(
              inventory?.stockDisplay?.current,
              inventory?.measurement,
            )}
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">
            Status
          </span>
          {stockStatusLabel ? (
            <Badge
              variant="secondary"
              className={`h-5 w-fit rounded-full border px-2 text-[10px] font-semibold leading-5 ${stockStatusTone}`}
            >
              {stockStatusLabel}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <span className="text-xs text-muted-foreground sm:hidden">
            Request qty
          </span>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Input
              value={draftQtyById?.[inventory?._id] ?? qty}
              required
              onChange={(event) => {
                setDraftQtyById((prev) => ({
                  ...prev,
                  [inventory?._id]: Inventory.sanitizeQtyInp(
                    inventory?.measurement,
                    event.target.value,
                  ),
                }));
              }}
              onBlur={() => {
                const nextQty = Math.max(
                  0,
                  Number(draftQtyById?.[inventory?._id] ?? qty) || 0,
                );
                dispatch(CartUpdate({ inventory, quantity: nextQty }));
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-9 w-24 rounded-md bg-background text-center text-sm tabular-nums shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:w-24"
            />
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        </div>

        <div className="flex items-center justify-end sm:justify-end">
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
    );
  },
);
