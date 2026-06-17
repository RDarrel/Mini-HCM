import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Formatter, Inventory } from "@/services/utilities";
import { MessageSquareMore, Trash2 } from "lucide-react";
import { memo, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const measurementLabels = (measurement = "") => {
  const normalized = String(measurement || "").toLowerCase();

  if (normalized === "volume") {
    return { unitCost: "Unit cost per Liter" };
  }

  if (normalized === "weight") {
    return { unitCost: "Unit cost per Kg" };
  }

  return { unitCost: "Unit cost per Piece" };
};

const ConvertToOrderItemsList = ({
  supplierId,
  rows = [],
  draftApprovedByInvId,
  setDraftApprovedByInvId,
  draftUnitCostByInvId,
  setDraftUnitCostByInvId,
  draftSupplierByInvId,
  onChangeSupplier,
  onRemoveItem,
}) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const rowsWithDrafts = useMemo(() => {
    return safeRows.map((item) => {
      const inventory = item?.inventory;
      const inventoryId = String(item?.__inventoryId || inventory?._id || "");

      return {
        item,
        inventoryId,
        approvedValue: draftApprovedByInvId?.[inventoryId] ?? 0,
        unitCost:
          Number(
            draftUnitCostByInvId?.[inventoryId] ?? item?.__unitCost ?? 0,
          ) || 0,
        supplierValue:
          String(
            draftSupplierByInvId?.[inventoryId] ?? item?.__supplierId ?? "",
          ) || String(supplierId || ""),
      };
    });
  }, [
    safeRows,
    draftApprovedByInvId,
    draftUnitCostByInvId,
    draftSupplierByInvId,
    supplierId,
  ]);

  return (
    <div className="space-y-2">
      {safeRows.length ? (
        <div className="hidden grid-cols-[1fr_150px_120px_170px_150px_120px_56px] gap-3 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80 sm:grid">
          <span>Item</span>
          <span>Available stock</span>
          <span>Request qty</span>
          <span>Unit cost</span>
          <span className="text-center">Approved qty</span>
          <span className="text-right">Subtotal</span>
          <span className="text-right"> </span>
        </div>
      ) : null}

      {rowsWithDrafts.map(
        (
          { item, inventoryId, approvedValue, unitCost, supplierValue },
          idx,
        ) => (
          <ItemRow
            key={item?.__inventoryId || item?._id || inventoryId || idx}
            supplierId={supplierId}
            item={item}
            inventoryId={inventoryId}
            approvedValue={approvedValue}
            setDraftApprovedByInvId={setDraftApprovedByInvId}
            unitCost={unitCost}
            setDraftUnitCostByInvId={setDraftUnitCostByInvId}
            supplierValue={supplierValue}
            onChangeSupplier={onChangeSupplier}
            onRemoveItem={onRemoveItem}
          />
        ),
      )}
    </div>
  );
};

export default memo(ConvertToOrderItemsList);

const ItemRow = memo(
  ({
    supplierId,
    item,
    inventoryId,
    approvedValue,
    setDraftApprovedByInvId,
    unitCost,
    setDraftUnitCostByInvId,
    supplierValue,
    onChangeSupplier,
    onRemoveItem,
  }) => {
    const inventory = item?.inventory;
    const availableStock = Number(item?.snapshot?.currentStock ?? 0) || 0;
    const requestQty = Number(item?.quantity?.request ?? 0) || 0;

    const { unitLabel, unitCostLabel } = useMemo(() => {
      const unitLabel =
        Inventory.getUnitByMeasurement(inventory?.measurement) || "";
      const unitCostLabel = measurementLabels(inventory?.measurement).unitCost;
      return { unitCostLabel, unitLabel };
    }, [inventory?.measurement]);

    const subtotal = useMemo(() => {
      const qty = Number(approvedValue) || 0;
      return (Number(unitCost) || 0) * qty;
    }, [approvedValue, unitCost]);

    const supplierOptions = useMemo(() => {
      const options = (
        Array.isArray(inventory?.suppliers) ? inventory.suppliers : []
      )
        .map((row) => ({
          id: String(row?.supplier?._id || ""),
          label: String(row?.supplier?.name || ""),
          cost: Number(row?.cost ?? 0) || 0,
          isPrimary: Boolean(row?.isPrimary),
        }))
        .filter((option) => option.id);

      return options.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    }, [inventory?.suppliers]);

    const selectedSupplier = useMemo(() => {
      return (
        supplierOptions.find((option) => option.id === supplierValue) || null
      );
    }, [supplierOptions, supplierValue]);

    const handleSupplierChange = (value) => {
      const nextId = String(value || "");
      onChangeSupplier?.(inventoryId, nextId);
    };

    const handleUnitCostChange = (event) => {
      const raw = String(event.target.value || 0);
      setDraftUnitCostByInvId((prev) => ({
        ...(prev || {}),
        [inventoryId]: Number(raw || 0),
      }));
    };

    const handleApprovedChange = (event) => {
      const raw = String(event.target.value || 0);
      setDraftApprovedByInvId((prev) => ({
        ...(prev || {}),
        [inventoryId]: Inventory.sanitizeQtyInp(inventory?.measurement, raw),
      }));
    };

    const handleRemove = () => onRemoveItem?.(supplierId, inventoryId);
    return (
      <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background/30 px-3 py-3 text-sm shadow-sm transition-colors hover:bg-background/40 sm:grid-cols-[1fr_150px_120px_170px_150px_120px_56px] sm:items-start sm:gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold flex gap-1 text-foreground">
            {item?.remarks ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareMore className="h-4 w-4" />
                    {inventory?.name || "Item"}
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  <p>{item?.remarks}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              inventory?.name || "Item"
            )}
          </p>
          <div className="mt-2 grid gap-1">
            <span className="text-xs text-muted-foreground">Supplier</span>
            <Select value={supplierValue} onValueChange={handleSupplierChange}>
              <SelectTrigger className="h-8 w-full bg-background/60 text-xs sm:w-64">
                <span className="flex w-full min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-left">
                    {selectedSupplier?.label || "Select supplier"}
                  </span>
                  {selectedSupplier ? (
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {Formatter.amount(selectedSupplier.cost)} /{" "}
                      {unitLabel || "unit"}
                    </span>
                  ) : null}
                </span>
              </SelectTrigger>
              <SelectContent>
                {supplierOptions.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className={option.isPrimary ? "font-semibold" : undefined}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="min-w-0 truncate">
                        {option.label || option.id}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {Formatter.amount(option.cost)}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">
            Available stock
          </span>
          <p className="font-semibold tabular-nums text-foreground">
            {availableStock}
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              {unitLabel || ""}
            </span>
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">
            Request qty
          </span>
          <p className="font-semibold tabular-nums text-foreground">
            {requestQty}
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              {unitLabel || ""}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">
            {unitCostLabel}
          </span>
          <div className="flex w-full items-center justify-between gap-2 sm:justify-start">
            <Input
              value={unitCost}
              required
              onChange={handleUnitCostChange}
              inputMode="decimal"
              className="h-9 w-32 rounded-md bg-background text-right text-sm tabular-nums shadow-sm"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              / {unitLabel || "unit"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-start sm:pl-2">
          <span className="text-xs text-muted-foreground sm:hidden">
            Approved qty
          </span>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Input
              value={approvedValue}
              required
              onChange={handleApprovedChange}
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-9 w-28 rounded-md bg-background text-center text-sm tabular-nums shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:w-24"
            />
            <span className="text-xs text-muted-foreground">{unitLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end sm:text-right">
          <span className="text-xs text-muted-foreground sm:hidden">
            Subtotal
          </span>
          <p className="font-semibold tabular-nums text-foreground">
            {Formatter.amount(subtotal)}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 sm:text-right">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-destructive hover:text-destructive"
            onClick={handleRemove}
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
