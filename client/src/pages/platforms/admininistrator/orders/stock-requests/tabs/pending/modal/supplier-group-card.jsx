import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Formatter } from "@/services/utilities";
import { CalendarIcon } from "lucide-react";
import ConvertToOrderItemsList from "./items-list";
import { toDate } from "./utils";

const SupplierGroupCard = memo(
  ({
    group,
    supplierLabelById,
    handleDateChange,
    draftApprovedByInvId,
    setDraftApprovedByInvId,
    draftUnitCostByInvId,
    setDraftUnitCostByInvId,
    draftSupplierByInvId,
    onChangeSupplier,
    onRemoveItem,
  }) => {
    const items = Array.isArray(group?.items) ? group.items : [];
    const itemsCount = items.length;
    const deliveryWindow = group?.deliveryWindow || {};

    const safeDeliveryWindow = {
      from: toDate(deliveryWindow?.from),
      to: toDate(deliveryWindow?.to),
    };

    const groupTotal = useMemo(() => {
      return items.reduce((sum, item) => {
        const inventoryId = String(item?.__inventoryId || "");
        const approvedQty = Number(draftApprovedByInvId[inventoryId] ?? 0) || 0;
        const unitCost =
          Number(draftUnitCostByInvId[inventoryId] ?? item?.__unitCost ?? 0) || 0;
        return sum + approvedQty * unitCost;
      }, 0);
    }, [items, draftApprovedByInvId, draftUnitCostByInvId]);

    return (
      <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-foreground">
                {supplierLabelById.get(group.supplier) ||
                  group?.supplierLabel ||
                  "Supplier"}
              </p>
              <Badge variant="secondary" className="rounded-full">
                {itemsCount} item(s)
              </Badge>
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {Formatter.amount(groupTotal)}
            </p>
            <p className="text-xs text-muted-foreground">
              Set expected delivery range for this supplier.
            </p>
          </div>

          <div className="w-full space-y-1 sm:w-80">
            <Label className="text-xs text-muted-foreground">
              Expected delivery range
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "h-10 w-full justify-start gap-2 text-left font-normal sm:w-[300px]",
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {deliveryWindow?.from ? (
                    deliveryWindow?.to ? (
                      <>
                        {Formatter.date(deliveryWindow.from)} –{" "}
                        {Formatter.date(deliveryWindow.to)}
                      </>
                    ) : (
                      <>{Formatter.date(deliveryWindow.from)}</>
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Pick a date range
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={safeDeliveryWindow?.from}
                  selected={safeDeliveryWindow}
                  onSelect={(range) => {
                    if (!range) return;

                    if (range.from && !range.to) {
                      handleDateChange(
                        { from: range.from, to: range.from },
                        group.supplier,
                      );
                    } else {
                      handleDateChange(range, group.supplier);
                    }
                  }}
                  numberOfMonths={2}
                  disabled={(day) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return day < today;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator className="my-4" />
        <ConvertToOrderItemsList
          supplierId={group.supplier}
          rows={items}
          draftApprovedByInvId={draftApprovedByInvId}
          setDraftApprovedByInvId={setDraftApprovedByInvId}
          draftUnitCostByInvId={draftUnitCostByInvId}
          setDraftUnitCostByInvId={setDraftUnitCostByInvId}
          draftSupplierByInvId={draftSupplierByInvId}
          onChangeSupplier={onChangeSupplier}
          onRemoveItem={onRemoveItem}
        />
      </div>
    );
  },
);

export default SupplierGroupCard;
