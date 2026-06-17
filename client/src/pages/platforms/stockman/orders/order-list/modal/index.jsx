import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  RECEIVE_DELIVERY,
  ToggleShowOrderDetails,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { CheckCircle2 } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ReceiveOrderItemsTable from "./items-table";
import {
  getItemKey,
  getItemsFromPurchase,
  getOrderedQty,
  getTodayISO,
  getUnitCost,
  normalizeQtyInput,
  round2,
  toNumber,
} from "./utils";
import Spinner from "@/components/shared/spinner";

const ReceiveOrderModal = () => {
  const { showOrderDetails, selected, formSubmitted } = useSelector(
    ({ purchases }) => purchases,
  );
  const { auth, token } = useSelector(({ auth }) => auth);
  const purchase = useMemo(() => selected ?? null, [selected]);

  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);
  const [editableItems, setEditableItems] = useState([]);
  const [notes, setNotes] = useState("");
  const minExpiryDate = useMemo(() => getTodayISO(), []);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!showOrderDetails) {
      setEditableItems([]);
      setNotes("");
      return;
    }

    setEditableItems(
      items.map((item) => ({
        ...item,
        quantity: {
          ...(item?.quantity || {}),
          received: normalizeQtyInput(getOrderedQty(item)),
        },
        expirationDate: "",
      })),
    );
  }, [items, showOrderDetails]);

  const close = (nextOpen) => {
    if (nextOpen) return;
    if (showOrderDetails) dispatch(ToggleShowOrderDetails());
  };

  const supplierName = purchase?.supplier?.name || "Supplier";
  const supplierContact = purchase?.supplier?.contact?.mobile || "";

  const counts = useMemo(() => {
    const total = editableItems.length;
    const flagged = editableItems.reduce((sum, item) => {
      const key = getItemKey(item);
      if (!key) return sum;
      const expected = round2(getOrderedQty(item));
      const received = round2(toNumber(item?.quantity?.received));
      return sum + (round2(expected - received) !== 0 ? 1 : 0);
    }, 0);
    return { total, flagged };
  }, [editableItems]);

  const grandSubtotal = useMemo(() => {
    return editableItems.reduce((sum, item) => {
      const key = getItemKey(item);
      if (!key) return sum;
      const unitCost = getUnitCost(item);
      if (unitCost === null) return sum;
      const received = round2(toNumber(item?.quantity?.received));
      return sum + Math.max(0, received) * unitCost;
    }, 0);
  }, [editableItems]);

  const grandVariance = useMemo(() => {
    return editableItems.reduce((sum, item) => {
      const key = getItemKey(item);
      if (!key) return sum;
      const unitCost = getUnitCost(item);
      if (unitCost === null) return sum;
      const expected = round2(getOrderedQty(item));
      const received = round2(toNumber(item?.quantity?.received));
      const discrepancy = round2(expected - received);
      return sum + discrepancy * unitCost;
    }, 0);
  }, [editableItems]);
  const shortageItemsCount = useMemo(() => {
    return editableItems.reduce((count, item) => {
      const expected = round2(getOrderedQty(item));
      const received = round2(toNumber(item?.quantity?.received));

      const discrepancy = round2(expected - received);

      return discrepancy > 0 ? count + 1 : count;
    }, 0);
  }, [editableItems]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formattedItems = editableItems.map((item) => ({
      ...item,
      quantity: {
        ...(item?.quantity || {}),
        received: toNumber(item?.quantity?.received),
      },
      inventory: item?.inventory?._id,
      measurement: item?.inventory?.measurement,
      expirationDate: item?.expirationDate ? String(item.expirationDate) : null,
    }));
    const _purchase = {
      ...purchase,
      received: {
        date: new Date().toISOString(),
        by: auth._id,
        amount: Number(grandSubtotal),
        note: String(notes || "").trim(),
      },
      status: "received",
      shortDeliveryAmount: Number(grandVariance),
      isShortDelivery: grandVariance > 0,
    };

    delete _purchase.orders;

    dispatch(
      RECEIVE_DELIVERY({
        data: { purchase: _purchase, orders: formattedItems },
        token,
      }),
    )
      .unwrap()
      .then(() => {
        close(false);
        setEditableItems([]);
        setNotes("");
        toast.success("Delivery received successfully.");
      })
      .catch((error) => {
        toast.error("Failed to receive delivery.");
        console.error(error);
      });
  };

  return (
    <Dialog open={showOrderDetails} onOpenChange={close}>
      <DialogContent className="flex max-h-[95vh] w-[95vw] flex-col overflow-hidden p-0 sm:max-w-5xl lg:max-w-7xl">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="sticky top-0 z-30 space-y-2 border-b border-border bg-background/90 px-6 pb-4 pt-6 text-left backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg">
                    Receive delivery
                  </DialogTitle>
                  <Badge variant="secondary" className="rounded-full">
                    {counts.total} item(s)
                  </Badge>
                  {counts.flagged ? (
                    <Badge className="rounded-full bg-destructive/15 text-destructive hover:bg-destructive/15">
                      {counts.flagged} mismatch
                    </Badge>
                  ) : null}
                </div>
                <DialogDescription className="text-sm leading-snug">
                  Confirm the delivered items. Enter the received quantity and
                  expiration date (if needed).
                </DialogDescription>
              </div>

              {/* header badges removed; keep only dialog close icon */}
            </div>

            <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[11px] font-medium  tracking-wide text-muted-foreground">
                  Supplier
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {supplierName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium  tracking-wide text-muted-foreground">
                  Supplier Contact
                </p>
                <p className="truncate text-sm font-semibold tabular-nums text-foreground">
                  {Formatter.mobile(supplierContact)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium  tracking-wide text-muted-foreground">
                  Delivery Window
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {purchase?.deliveryWindow?.from &&
                  purchase?.deliveryWindow?.to
                    ? `${Formatter.date(purchase.deliveryWindow.from)} - ${Formatter.date(purchase.deliveryWindow.to)}`
                    : purchase?.deliveryWindow?.from
                      ? Formatter.date(purchase.deliveryWindow.from)
                      : "Not set"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto">
            <Separator />

            <div className="bg-muted/10 px-6 py-5">
              {!editableItems.length ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 p-5 text-sm text-muted-foreground">
                  No items found for this order.
                </div>
              ) : (
                <ReceiveOrderItemsTable
                  items={editableItems}
                  setItems={setEditableItems}
                  minExpiryDate={minExpiryDate}
                  counts={counts}
                  grandSubtotal={grandSubtotal}
                  grandVariance={grandVariance}
                  shortageItemsCount={shortageItemsCount}
                />
              )}
            </div>
          </div>

          <Separator />

          <DialogFooter className="flex flex-col gap-3 px-6 py-4">
            <div className="w-full">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Label
                  htmlFor="receive-order-notes"
                  className="shrink-0 whitespace-nowrap text-[11px] font-medium tracking-wide text-muted-foreground"
                >
                  Remarks
                </Label>
                <Textarea
                  id="receive-order-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter remarks..."
                  className="min-h-[40px] w-full resize-none bg-background text-sm sm:flex-1"
                  rows={1}
                />
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => close(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full gap-2 sm:w-auto"
                disabled={formSubmitted || !editableItems.length}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Delivery <Spinner formSubmitted={formSubmitted} />
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ReceiveOrderModal);
