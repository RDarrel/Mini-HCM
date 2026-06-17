import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CartClear,
  SAVE,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/stock-requests";
import { Inventory } from "@/services/utilities";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReviewOrderItemsList from "./items-list";
import { Search, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";

const ReviewStockRequestModal = () => {
  const dispatch = useDispatch();
  const { token, auth } = useSelector(({ auth }) => auth);
  const {
    cart = [],
    formSubmitted,
    reviewOpen,
  } = useSelector(({ stockRequests }) => stockRequests);

  const [itemSearch, setItemSearch] = useState("");
  const [draftQtyById, setDraftQtyById] = useState({});
  const [draftRemarksById, setDraftRemarksById] = useState({});

  useEffect(() => {
    if (!reviewOpen) return;
    setItemSearch("");

    const initialDraft = {};
    const initialRemarks = {};
    for (const row of Array.isArray(cart) ? cart : []) {
      const id = String(row?.inventory?._id || "");
      if (!id) continue;
      initialDraft[id] = row?.quantity ?? 1;
      initialRemarks[id] = row?.remarks ?? "";
    }
    setDraftQtyById(initialDraft);
    setDraftRemarksById(initialRemarks);
  }, [reviewOpen, cart]);

  const visibleCart = useMemo(() => {
    const query = String(itemSearch || "")
      .trim()
      .toLowerCase();
    const safeCart = Array.isArray(cart) ? cart : [];
    if (!query) return safeCart;
    return safeCart.filter((row) =>
      String(row?.inventory?.name || "")
        .toLowerCase()
        .includes(query),
    );
  }, [cart, itemSearch]);

  const totals = useMemo(() => {
    const safeCart = Array.isArray(cart) ? cart : [];
    return { totalItems: safeCart.length };
  }, [cart]);

  const close = (nextOpen) => dispatch(SetReviewOpen(Boolean(nextOpen)));

  const submitRequest = (event) => {
    event.preventDefault();
    console.log("submitted");
    if (!cart.length) return;
    console.log("cart", cart);
    const items = cart.map(({ quantity, inventory, ...rest }) => ({
      ...rest,
      unit: Inventory.getUnitByMeasurement(
        inventory?.measurement,
      )?.toLowerCase(),
      inventory: inventory?._id,
      quantity: {
        request: quantity,
        approved: quantity,
      },
      snapshot: {
        currentStock: inventory?.stockDisplay?.current,
        reorderLevel: inventory?.stock.min,
      },
    }));

    const request = {
      requestedBy: auth?._id,
      items,
    };

    dispatch(SAVE({ data: request, token }))
      .unwrap()
      .then(() => {
        setDraftQtyById({});
        setDraftRemarksById({});
        setItemSearch("");
        dispatch(CartClear());
        close(false);
        toast.success("Stock request submitted.");
      })
      .catch((error) => {
        toast.error("Failed to submit request. Please try again.");
        console.error("Error submitting stock request:", error);
      });
  };

  return (
    <Dialog open={reviewOpen} onOpenChange={close}>
      <DialogContent
        className="max-w-4xl p-1"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <form
          onSubmit={submitRequest}
          className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto]"
        >
          <div className="rounded-t-xl border-b border-border bg-card/70 px-5 py-4 pr-16">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/70 shadow-sm">
                      <ClipboardList className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="truncate text-lg">
                        Review stock request
                      </DialogTitle>
                      <DialogDescription className="hidden text-sm leading-snug sm:block">
                        Confirm the items and requested quantities before
                        submitting.
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <Badge variant="secondary" className="rounded-full">
                    Final review
                  </Badge>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-auto px-5 mt-4">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
                <div className="w-full">
                  <Label className="text-xs text-muted-foreground">
                    Search item
                  </Label>
                  <div className="relative mt-1">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={itemSearch}
                      type="search"
                      onChange={(event) => setItemSearch(event.target.value)}
                      placeholder="Search items..."
                      className="h-10 w-full pl-9"
                    />
                  </div>
                </div>
              </div>

              {visibleCart.length ? (
                <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
                  <ReviewOrderItemsList
                    rows={visibleCart}
                    setDraftQtyById={setDraftQtyById}
                    draftQtyById={draftQtyById}
                    draftRemarksById={draftRemarksById}
                    setDraftRemarksById={setDraftRemarksById}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      No items found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try a different keyword.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-b-xl border-t border-border bg-card/70 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                Total items:{" "}
                <span className="font-semibold text-foreground">
                  {totals.totalItems ?? 0}
                </span>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => close(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formSubmitted || !cart.length}>
                  Submit request <Spinner formSubmitted={formSubmitted} />
                </Button>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewStockRequestModal;
