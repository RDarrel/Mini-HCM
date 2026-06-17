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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/shared/spinner";
import { SAVE as SAVE_PURCHASES } from "@/services/redux/slices/procurement/purchases";
import { UPDATE as UPDATE_STOCK_REQUEST } from "@/services/redux/slices/procurement/stock-requests";
import { Formatter, fullName, Inventory } from "@/services/utilities";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SupplierGroupCard from "./supplier-group-card";
import { buildGroupsFromRequest, getDefaultDeliveryWindow } from "./utils";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const ConvertToOrderModal = ({ open, onOpenChange, request }) => {
  const dispatch = useDispatch();
  const { token, auth } = useSelector(({ auth }) => auth);
  const { collections: suppliers } = useSelector(({ suppliers }) => suppliers);
  const { collections: inventories } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );

  const [formattedGroups, setFormattedGroups] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [itemSearch, setItemSearch] = useState("");
  const [draftApprovedByInvId, setDraftApprovedByInvId] = useState({});
  const [draftUnitCostByInvId, setDraftUnitCostByInvId] = useState({});
  const [draftSupplierByInvId, setDraftSupplierByInvId] = useState({});

  const supplierLabelById = useMemo(() => {
    const map = new Map();
    for (const option of Array.isArray(suppliers) ? suppliers : []) {
      if (option?._id) map.set(String(option._id), String(option.name || ""));
    }
    return map;
  }, [suppliers]);

  const inventoryById = useMemo(() => {
    const map = new Map();
    for (const row of Array.isArray(inventories) ? inventories : []) {
      if (row?._id) map.set(String(row._id), row);
    }
    return map;
  }, [inventories]);

  const requestedByLabel = useMemo(() => {
    const requestedBy = request?.requestedBy;
    if (requestedBy && typeof requestedBy === "object") {
      return fullName(requestedBy?.fullName || requestedBy);
    }
    return String(requestedBy || "Requester");
  }, [request]);

  useEffect(() => {
    if (!open) return;

    const groups = buildGroupsFromRequest(request, inventoryById);
    setFormattedGroups(groups);

    const initialDraft = {};
    const initialUnitCostDraft = {};
    const initialSupplierDraft = {};
    for (const group of groups) {
      for (const item of Array.isArray(group?.items) ? group.items : []) {
        const inventoryId = String(item?.__inventoryId || "");
        if (!inventoryId) continue;
        initialDraft[inventoryId] = Number(item?.quantity?.approved ?? 0) || 0;
        initialUnitCostDraft[inventoryId] = Number(item?.__unitCost ?? 0) || 0;
        initialSupplierDraft[inventoryId] = String(
          item?.__supplierId || group?.supplier || "",
        );
      }
    }
    setDraftApprovedByInvId(initialDraft);
    setDraftUnitCostByInvId(initialUnitCostDraft);
    setDraftSupplierByInvId(initialSupplierDraft);
    setFormSubmitted(false);
    setSupplierFilter("all");
    setItemSearch("");
  }, [open, request, inventoryById]);

  const supplierFilterOptions = useMemo(() => {
    return (Array.isArray(formattedGroups) ? formattedGroups : [])
      .map((group) => String(group?.supplier || ""))
      .filter(Boolean);
  }, [formattedGroups]);

  useEffect(() => {
    if (supplierFilter === "all") return;
    if (!supplierFilterOptions.includes(supplierFilter)) {
      setSupplierFilter("all");
    }
  }, [supplierFilter, supplierFilterOptions]);

  const totals = useMemo(() => {
    const groups = Array.isArray(formattedGroups) ? formattedGroups : [];

    const suppliersCount = groups.length;
    const itemsCount = groups.reduce((sum, group) => {
      return sum + (Array.isArray(group?.items) ? group.items : []).length;
    }, 0);

    const totalAmount = groups.reduce((sum, group) => {
      const groupAmount = (
        Array.isArray(group?.items) ? group.items : []
      ).reduce((sub, item) => {
        const inventoryId = String(item?.__inventoryId || "");
        const approvedQty = Number(draftApprovedByInvId[inventoryId] ?? 0) || 0;
        const unitCost =
          Number(draftUnitCostByInvId[inventoryId] ?? item?.__unitCost ?? 0) ||
          0;
        return sub + approvedQty * unitCost;
      }, 0);

      return sum + groupAmount;
    }, 0);

    return { suppliersCount, totalAmount, itemsCount };
  }, [formattedGroups, draftApprovedByInvId, draftUnitCostByInvId]);

  const handleDateChange = useCallback((newDate, supplierId) => {
    setFormattedGroups((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const idx = next.findIndex(
        (g) => String(g?.supplier || "") === supplierId,
      );
      if (idx < 0) return prev;
      next[idx] = { ...next[idx], deliveryWindow: newDate };
      return next;
    });
  }, []);

  const removeItem = useCallback((supplierId, inventoryId) => {
    const invId = String(inventoryId || "");
    const supId = String(supplierId || "");
    if (!invId || !supId) return;

    setFormattedGroups((prev) => {
      const groups = Array.isArray(prev) ? prev : [];
      const sourceGroupIdx = groups.findIndex(
        (group) => String(group?.supplier || "") === supId,
      );
      if (sourceGroupIdx < 0) return prev;

      const sourceGroup = groups[sourceGroupIdx];
      const sourceItems = Array.isArray(sourceGroup?.items)
        ? sourceGroup.items
        : [];
      const sourceItemIdx = sourceItems.findIndex(
        (item) => String(item?.__inventoryId || "") === invId,
      );
      if (sourceItemIdx < 0) return prev;

      const nextGroups = [...groups];
      const nextSourceItems = [...sourceItems];
      nextSourceItems.splice(sourceItemIdx, 1);

      if (!nextSourceItems.length) {
        nextGroups.splice(sourceGroupIdx, 1);
        return nextGroups;
      }

      nextGroups[sourceGroupIdx] = { ...sourceGroup, items: nextSourceItems };
      return nextGroups;
    });

    setDraftApprovedByInvId((prev) => {
      const next = { ...(prev || {}) };
      delete next[invId];
      return next;
    });
  }, []);

  const visibleGroups = useMemo(() => {
    const query = String(itemSearch || "")
      .trim()
      .toLowerCase();

    const baseGroups =
      supplierFilter !== "all"
        ? (Array.isArray(formattedGroups) ? formattedGroups : []).filter(
            (group) => String(group?.supplier || "") === supplierFilter,
          )
        : Array.isArray(formattedGroups)
          ? formattedGroups
          : [];

    if (!query) return baseGroups;

    return baseGroups
      .map((group) => {
        const items = (Array.isArray(group?.items) ? group.items : []).filter(
          (item) => {
            const name = String(item?.inventory?.name || "").toLowerCase();
            return name.includes(query);
          },
        );

        return { ...group, items };
      })
      .filter((group) => (group?.items || []).length);
  }, [formattedGroups, itemSearch, supplierFilter]);

  const close = (nextOpen) => {
    const shouldOpen = Boolean(nextOpen);
    if (!shouldOpen) setFormSubmitted(false);
    onOpenChange?.(shouldOpen);
  };

  const moveItemToSupplier = useCallback(
    (inventoryId, nextSupplierId) => {
      const invId = String(inventoryId || "");
      const supplierId = String(nextSupplierId || "");
      if (!invId || !supplierId) return;

      const inventory = inventoryById.get(invId);
      const supplierRow =
        inventory && supplierId
          ? (Array.isArray(inventory?.suppliers)
              ? inventory.suppliers
              : []
            ).find((row) => String(row?.supplier?._id || "") === supplierId)
          : null;

      const nextUnitCost = supplierRow
        ? Number(supplierRow?.cost ?? 0) || 0
        : null;

      setDraftSupplierByInvId((prev) => ({
        ...(prev || {}),
        [invId]: supplierId,
      }));
      setDraftUnitCostByInvId((prev) => {
        if (!supplierRow) return prev;
        return { ...(prev || {}), [invId]: nextUnitCost };
      });

      setFormattedGroups((prev) => {
        const groups = Array.isArray(prev) ? prev : [];

        let sourceGroupIdx = -1;
        let sourceItemIdx = -1;
        for (let idx = 0; idx < groups.length; idx += 1) {
          const group = groups[idx];
          const items = Array.isArray(group?.items) ? group.items : [];
          const itemIdx = items.findIndex(
            (item) => String(item?.__inventoryId || "") === invId,
          );
          if (itemIdx > -1) {
            sourceGroupIdx = idx;
            sourceItemIdx = itemIdx;
            break;
          }
        }

        if (sourceGroupIdx < 0 || sourceItemIdx < 0) return prev;

        const nextGroups = [...groups];
        const sourceGroup = nextGroups[sourceGroupIdx];
        const sourceItems = Array.isArray(sourceGroup?.items)
          ? sourceGroup.items
          : [];
        const nextSourceItems = [...sourceItems];
        const [movingItem] = nextSourceItems.splice(sourceItemIdx, 1);

        if (!movingItem) return prev;

        if (!nextSourceItems.length) {
          nextGroups.splice(sourceGroupIdx, 1);
        } else {
          nextGroups[sourceGroupIdx] = {
            ...sourceGroup,
            items: nextSourceItems,
          };
        }

        const inventoryForItem =
          inventoryById.get(invId) || movingItem?.inventory;
        const nextSupplierLabel =
          supplierLabelById.get(supplierId) ||
          supplierRow?.supplier?.name ||
          String(movingItem?.__supplierLabel || "Supplier");
        const resolvedUnitCost =
          supplierRow && nextUnitCost != null
            ? nextUnitCost
            : Number(movingItem?.__unitCost ?? 0) || 0;

        const updatedItem = {
          ...movingItem,
          inventory: inventoryForItem,
          __supplierId: supplierId,
          __supplierLabel: nextSupplierLabel,
          __unitCost: resolvedUnitCost,
        };

        const targetIdx = nextGroups.findIndex(
          (group) => String(group?.supplier || "") === supplierId,
        );
        if (targetIdx > -1) {
          const targetGroup = nextGroups[targetIdx];
          const targetItems = Array.isArray(targetGroup?.items)
            ? targetGroup.items
            : [];
          nextGroups[targetIdx] = {
            ...targetGroup,
            items: [...targetItems, updatedItem],
          };
          return nextGroups;
        }

        const defaultWindow = getDefaultDeliveryWindow();
        nextGroups.push({
          supplier: supplierId,
          supplierLabel: nextSupplierLabel,
          items: [updatedItem],
          deliveryWindow: { from: defaultWindow.from, to: defaultWindow.to },
          totalAmount: 0,
        });
        return nextGroups;
      });
    },
    [inventoryById, supplierLabelById],
  );

  const placeOrder = (event) => {
    event.preventDefault();
    if (formSubmitted) return;
    const requestId = String(request?._id || "");
    if (!requestId) return;

    const groups = Array.isArray(formattedGroups) ? formattedGroups : [];
    if (!groups.length) return;

    setFormSubmitted(true);

    const cart = [];
    const purchases = [];
    const includedInventoryIds = new Set();

    for (const group of groups) {
      const supplierId = String(group?.supplier || "");
      const deliveryWindow =
        group?.deliveryWindow || getDefaultDeliveryWindow();

      let groupAmount = 0;
      const groupItems = Array.isArray(group?.items) ? group.items : [];

      for (const item of groupItems) {
        const inventoryId = String(item?.__inventoryId || "");
        if (!inventoryId) continue;
        includedInventoryIds.add(inventoryId);

        const inventory = inventoryById.get(inventoryId) || item?.inventory;
        const unitCost =
          Number(draftUnitCostByInvId[inventoryId] ?? item?.__unitCost ?? 0) ||
          0;
        const approvedQty = Number(draftApprovedByInvId[inventoryId] ?? 0) || 0;

        groupAmount += approvedQty * unitCost;

        cart.push({
          supplier: supplierId,
          cost: unitCost,
          inventory: inventoryId,
          unit: Inventory.getUnitByMeasurement(
            inventory?.measurement,
          )?.toLowerCase(),
          quantity: { incoming: approvedQty },
        });
      }

      purchases.push({
        supplier: supplierId,
        deliveryWindow,
        totalAmount: groupAmount,
        status: "incoming",
      });
    }

    const updatedItems = (
      Array.isArray(request?.items) ? request.items : []
    ).map((item) => {
      const inventoryId = String(item?.inventory?._id || item?.inventory || "");
      const isDeleted = inventoryId && !includedInventoryIds.has(inventoryId);

      const approvedQty = inventoryId
        ? Number(draftApprovedByInvId[inventoryId] ?? 0) || 0
        : 0;

      return {
        _id: item?._id,
        inventory: inventoryId || item?.inventory,
        unit: item?.unit,
        remarks: item?.remarks,
        snapshot: item?.snapshot,
        purchase: item?.purchase,
        deletedAt: isDeleted ? new Date() : item?.deletedAt,
        quantity: {
          request: Number(item?.quantity?.request ?? 0) || 0,
          approved: isDeleted
            ? Number(item?.quantity?.approved ?? 0) || 0
            : approvedQty,
        },
      };
    });
    dispatch(SAVE_PURCHASES({ data: { cart, purchases }, token }))
      .unwrap()
      .then(() => {
        return dispatch(
          UPDATE_STOCK_REQUEST({
            data: {
              _id: requestId,
              status: "approved",
              items: updatedItems,
              admin: {
                reviewedBy: auth?._id,
                reviewedAt: new Date(),
              },
              conversion: {
                isConvertedToOrder: true,
                convertedBy: auth?._id,
                convertedAt: new Date(),
              },
              isAdmin: true,
            },
            token,
          }),
        ).unwrap();
      })
      .then(() => {
        toast.success("Order placed successfully.");
        close(false);
      })
      .catch(() => toast.error("Failed to place order. Please try again."))
      .finally(() => setFormSubmitted(false));
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className="max-w-6xl p-1"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <form
          onSubmit={placeOrder}
          className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto]"
        >
          <div className="rounded-t-xl border-b border-border bg-card/70 px-5 py-4 pr-16">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/70 shadow-sm">
                      <ShoppingBag className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="truncate text-lg">
                        Convert to order
                      </DialogTitle>
                      <DialogDescription className="hidden text-sm leading-snug sm:block">
                        Review items grouped by supplier before placing orders.
                      </DialogDescription>
                    </div>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    Requested by:{" "}
                    <span className="font-medium text-foreground/90">
                      {requestedByLabel}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Items
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {totals.itemsCount}
                      </span>
                    </div>
                    <span
                      className="h-4 w-px bg-border/70"
                      aria-hidden="true"
                    />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Suppliers
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formattedGroups.length}
                      </span>
                    </div>
                    <span
                      className="h-4 w-px bg-border/70"
                      aria-hidden="true"
                    />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Total Amount
                      </span>
                      <span className="text-base font-semibold leading-none tabular-nums text-foreground">
                        {Formatter.amount(totals.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-auto px-5 py-4">
            <div className="space-y-4">
              <div className="grid gap-4 rounded-xl border border-border bg-card/60 p-4 shadow-sm sm:grid-cols-2">
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

                <div className="w-full sm:justify-self-stretch">
                  <Label className="text-xs text-muted-foreground">
                    Supplier
                  </Label>
                  <Select
                    value={supplierFilter}
                    onValueChange={setSupplierFilter}
                  >
                    <SelectTrigger className="mt-1 h-10 w-full bg-background/60">
                      <SelectValue placeholder="All suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All suppliers</SelectItem>
                      {supplierFilterOptions.map((supplierId) => (
                        <SelectItem key={supplierId} value={supplierId}>
                          {supplierLabelById.get(supplierId) || supplierId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {visibleGroups.length ? (
                visibleGroups.map((group) => (
                  <SupplierGroupCard
                    key={String(group?.supplier || "")}
                    group={group}
                    supplierLabelById={supplierLabelById}
                    handleDateChange={handleDateChange}
                    draftApprovedByInvId={draftApprovedByInvId}
                    setDraftApprovedByInvId={setDraftApprovedByInvId}
                    draftUnitCostByInvId={draftUnitCostByInvId}
                    setDraftUnitCostByInvId={setDraftUnitCostByInvId}
                    draftSupplierByInvId={draftSupplierByInvId}
                    onChangeSupplier={moveItemToSupplier}
                    onRemoveItem={removeItem}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      No items found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try a different supplier or keyword.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-b-xl border-t border-border bg-card/70 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">Items</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {totals.itemsCount}
                  </span>
                </div>
                <span className="h-4 w-px bg-border/70" aria-hidden="true" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Suppliers
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formattedGroups.length}
                  </span>
                </div>
                <span className="h-4 w-px bg-border/70" aria-hidden="true" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Total Amount
                  </span>
                  <span className="text-base font-semibold leading-none tabular-nums text-foreground">
                    {Formatter.amount(totals.totalAmount)}
                  </span>
                </div>
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
                  disabled={formSubmitted || !formattedGroups.length}
                >
                  Place order <Spinner formSubmitted={formSubmitted} />
                </Button>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ConvertToOrderModal);
