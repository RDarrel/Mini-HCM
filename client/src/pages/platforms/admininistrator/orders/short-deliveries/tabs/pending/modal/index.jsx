import Spinner from "@/components/shared/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ToggleShortDeliveryActionModal,
  UPDATE,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { HandCoins, ReceiptText, Truck } from "lucide-react";
import { CalendarClock, UserRound } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import DeliveryPeriodPicker from "./delivery-period";
import ShortDeliveryItemsTable from "./items-table";
import {
  computeShortGrandTotalAmount,
  formatDateTime,
  formatReceivedBy,
  getDefaultDeliveryWindow,
  getItemsFromPurchase,
} from "./utils";

const ShortDeliveryActionModal = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);
  const {
    shortDeliveryActionOpen,
    shortDeliveryActionSelected,
    shortDeliveryActionType,
    formSubmitted,
  } = useSelector(({ purchases }) => purchases);

  const purchase = useMemo(
    () => shortDeliveryActionSelected ?? null,
    [shortDeliveryActionSelected],
  );
  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);

  const [action, setAction] = useState(null);
  const resolvedAction = action || shortDeliveryActionType || "redelivery";

  const [deliveryWindow, setDeliveryWindow] = useState(
    getDefaultDeliveryWindow,
  );

  useEffect(() => {
    if (!shortDeliveryActionOpen) return;
    setDeliveryWindow(getDefaultDeliveryWindow());
    setAction(null);
  }, [shortDeliveryActionOpen]);

  const headerMeta = useMemo(() => {
    if (resolvedAction === "refunded") {
      return {
        title: "Refund short delivery",
        description:
          "You're about to mark this short delivery as refunded. Review the details below, then confirm.",
      };
    }

    return {
      title: "Confirm redelivery",
      description:
        "You're about to mark this short delivery for redelivery. Review the details below, then confirm.",
    };
  }, [resolvedAction]);

  const close = (nextOpen) => {
    if (nextOpen) return;
    if (shortDeliveryActionOpen) dispatch(ToggleShortDeliveryActionModal());
    setAction(null);
  };

  const supplierName =
    purchase?.supplier?.name ||
    purchase?.supplier?.company ||
    purchase?.supplier?.label ||
    "Supplier";

  const receivedAt =
    purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;

  const grandTotalAmount = useMemo(
    () => computeShortGrandTotalAmount(items),
    [items],
  );

  const handleConfirm = async (nextStatus) => {
    const purchaseId = String(purchase?._id || "");
    if (!purchaseId || !token) return;

    if (
      nextStatus === "redelivery" &&
      !(deliveryWindow?.from && deliveryWindow?.to)
    ) {
      toast.error("Please set a delivery period.");
      return;
    }

    try {
      await dispatch(
        UPDATE({
          token,
          data: {
            _id: purchaseId,
            status: nextStatus,
            ...(nextStatus === "redelivery" && {
              deliveryWindow: {
                from: deliveryWindow.from,
                to: deliveryWindow.to,
              },
            }),
          },
        }),
      ).unwrap();

      toast.success(
        nextStatus === "refunded"
          ? "Marked as refunded successfully."
          : "Marked for redelivery successfully.",
      );

      dispatch(ToggleShortDeliveryActionModal());
      setAction(null);
    } catch (error) {
      toast.error("Failed to update short delivery.");
    }
  };

  return (
    <Dialog open={shortDeliveryActionOpen} onOpenChange={close}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base">{headerMeta.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {headerMeta.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-base font-semibold text-foreground">
                {supplierName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Address:{" "}
                <span className="font-medium text-foreground/90">
                  {purchase?.supplier?.address
                    ? purchase.supplier.address
                    : "-"}
                </span>
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <div className="flex items-end justify-start gap-3 sm:justify-end">
                <div className="flex flex-col items-start leading-none sm:items-end">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Total amount
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {Formatter.amount(grandTotalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-border bg-background/40 p-4 text-sm sm:grid-cols-3">
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
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Received date</p>
                <p className="truncate font-semibold text-foreground">
                  {formatDateTime(receivedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="truncate font-semibold text-foreground">
                  {items.length} item(s)
                </p>
              </div>
            </div>
          </div>

          <ShortDeliveryItemsTable items={items} />
        </div>

        <Separator />

        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {resolvedAction === "redelivery" ? (
            <DeliveryPeriodPicker
              deliveryWindow={deliveryWindow}
              setDeliveryWindow={setDeliveryWindow}
            />
          ) : (
            <div />
          )}

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => {
                setAction(null);
                dispatch(ToggleShortDeliveryActionModal());
              }}
              disabled={formSubmitted}
            >
              Cancel
            </Button>

            <Button
              type="button"
              className="h-10"
              variant={
                resolvedAction === "refunded" ? "destructive" : "default"
              }
              disabled={
                !token ||
                formSubmitted ||
                (resolvedAction === "redelivery" &&
                  !(deliveryWindow?.from && deliveryWindow?.to))
              }
              onClick={() => handleConfirm(resolvedAction)}
            >
              {resolvedAction === "refunded" ? (
                <>
                  <HandCoins className="h-4 w-4" />
                  Confirm refund
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  Confirm redelivery
                </>
              )}
              <Spinner formSubmitted={formSubmitted} />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ShortDeliveryActionModal);
