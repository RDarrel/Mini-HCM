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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stock } from "@/services/utilities";
import { UPDATE } from "@/services/redux/slices/procurement/stock-requests";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";
import { capitalize } from "lodash";

const sanitizeQty = (value) => {
  const raw = String(value ?? "").replace(/[^\d]/g, "");
  if (!raw) return 0;
  return Math.max(0, Number(raw) || 0);
};

const PendingUpdateModal = ({ open, onOpenChange, request }) => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ stockRequests }) => stockRequests);

  const requestId = String(request?._id || "");

  const [itemSearch, setItemSearch] = useState("");
  const [draftItems, setDraftItems] = useState([]);
  const [draftQtyById, setDraftQtyById] = useState({});
  const [draftRemarksById, setDraftRemarksById] = useState({});

  useEffect(() => {
    if (!open) return;
    setItemSearch("");

    const items = Array.isArray(request?.items) ? request.items : [];
    setDraftItems(items);

    const qtyDraft = {};
    const remarksDraft = {};
    for (const row of items) {
      const invId = String(row?.inventory?._id || row?.inventory || "");
      if (!invId) continue;
      qtyDraft[invId] = Number(row?.quantity?.request) || 0;
      remarksDraft[invId] = String(row?.remarks || "");
    }
    setDraftQtyById(qtyDraft);
    setDraftRemarksById(remarksDraft);
  }, [open, request]);

  const visibleItems = useMemo(() => {
    const query = String(itemSearch || "")
      .trim()
      .toLowerCase();
    const items = Array.isArray(draftItems) ? draftItems : [];
    if (!query) return items;
    return items.filter((row) =>
      String(row?.inventory?.name || "")
        .toLowerCase()
        .includes(query),
    );
  }, [draftItems, itemSearch]);

  const totals = useMemo(() => {
    const items = Array.isArray(draftItems) ? draftItems : [];
    return { totalItems: items.length };
  }, [draftItems]);

  const close = (nextOpen) => {
    onOpenChange?.(Boolean(nextOpen));
    if (!nextOpen) {
      setDraftItems([]);
      setDraftQtyById({});
      setDraftRemarksById({});
      setItemSearch("");
    }
  };

  const removeItem = (invId) => {
    const id = String(invId || "");
    if (!id) return;
    setDraftItems((prev) =>
      (Array.isArray(prev) ? prev : []).filter((row) => {
        const rowId = String(row?.inventory?._id || row?.inventory || "");
        return rowId !== id;
      }),
    );
    setDraftQtyById((prev) => {
      const next = { ...(prev || {}) };
      delete next[id];
      return next;
    });
    setDraftRemarksById((prev) => {
      const next = { ...(prev || {}) };
      delete next[id];
      return next;
    });
  };

  const submitUpdate = (event) => {
    event.preventDefault();
    if (!token || !requestId) return;

    const nextItems = (Array.isArray(draftItems) ? draftItems : [])
      .map((row) => {
        const invId = String(row?.inventory?._id || row?.inventory || "");
        if (!invId) return null;

        const nextQty = sanitizeQty(draftQtyById?.[invId]);
        const nextRemarks = String(draftRemarksById?.[invId] ?? "").trim();
        const unit = String(row?.unit || "")
          .trim()
          .toLowerCase();

        return {
          ...row,
          inventory: invId,
          unit,
          remarks: nextRemarks,
          quantity: {
            request: nextQty,
            approved: nextQty,
          },
        };
      })
      .filter(Boolean);

    if (!nextItems.length) {
      toast.error("Please keep at least one item in the request.");
      return;
    }

    dispatch(
      UPDATE({
        data: {
          _id: requestId,
          items: nextItems,
          status: "pending",
        },
        token,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Request updated.");
        close(false);
      })
      .catch(() => {
        toast.error("Failed to update request. Please try again.");
      });
  };

  return (
    <Dialog open={Boolean(open)} onOpenChange={close}>
      <DialogContent
        className="max-w-4xl p-1"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <form
          onSubmit={submitUpdate}
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
                        Update stock request
                      </DialogTitle>
                      <DialogDescription className="hidden text-sm leading-snug sm:block">
                        Adjust items and quantities before resubmitting.
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <Badge variant="secondary" className="rounded-full">
                    Pending update
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

              {visibleItems.length ? (
                <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
                  {visibleItems.length ? (
                    <div className="hidden grid-cols-[1fr_140px_120px_160px_40px] gap-2 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80 sm:grid">
                      <span>Item</span>
                      <span>Available Stock</span>
                      <span>Reorder Level</span>
                      <span className="text-center">Request qty</span>
                      <span />
                    </div>
                  ) : null}

                  <div className="space-y-3 mt-2">
                    {visibleItems.map((row, idx) => {
                      const inventory = row?.inventory;
                      const invId = String(
                        inventory?._id || row?.inventory || "",
                      );
                      const name = inventory?.name || "Item";
                      const unit = capitalize(row?.unit || "");

                      const currentStockDisplay = Stock.display(
                        row?.snapshot?.currentStock,
                        inventory?.measurement,
                      );

                      return (
                        <div
                          key={invId || idx}
                          className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background/30 px-3 py-3 text-sm shadow-sm transition-colors hover:bg-background/40 sm:grid-cols-[1fr_140px_120px_160px_40px] sm:items-center"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {name}
                            </p>
                            <Input
                              value={draftRemarksById?.[invId] ?? ""}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                setDraftRemarksById((prev) => ({
                                  ...(prev || {}),
                                  [invId]: nextValue,
                                }));
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
                              {currentStockDisplay}
                            </p>
                          </div>

                          <div className="flex items-baseline font-semibold justify-between gap-2 sm:block">
                            {Stock.display(
                              row?.snapshot?.reorderLevel,
                              inventory?.measurement,
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 sm:justify-start">
                            <span className="text-xs text-muted-foreground sm:hidden">
                              Request qty
                            </span>
                            <div className="flex w-full items-center gap-2 sm:w-auto">
                              <Input
                                value={draftQtyById?.[invId] ?? 0}
                                required
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  setDraftQtyById((prev) => ({
                                    ...(prev || {}),
                                    [invId]: sanitizeQty(nextValue),
                                  }));
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="h-9 w-24 rounded-md bg-background text-center text-sm tabular-nums shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:w-24"
                              />
                              <span className="text-xs text-muted-foreground">
                                {unit}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end sm:justify-end">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-md text-destructive hover:text-destructive"
                              onClick={() => removeItem(invId)}
                              aria-label={`Remove ${name}`}
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                <Button
                  type="submit"
                  disabled={formSubmitted || !draftItems.length}
                >
                  Save changes <Spinner formSubmitted={formSubmitted} />
                </Button>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PendingUpdateModal;
