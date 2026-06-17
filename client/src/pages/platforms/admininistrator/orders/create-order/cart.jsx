import { memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartClear,
  CartRemove,
  CartUpdate,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter, Inventory } from "@/services/utilities";
import { ClipboardList, Minus, Plus, Search, Trash2 } from "lucide-react";

const measurementLabels = (measurement = "") => {
  const normalized = String(measurement || "").toLowerCase();

  if (normalized === "volume") {
    return { unitCost: "Unit cost per Liter", qty: "Liters" };
  }

  if (normalized === "weight") {
    return { unitCost: "Unit cost per Kg", qty: "Kg" };
  }

  return { unitCost: "Unit cost per Piece", qty: "Pieces" };
};

const CartItemRow = memo(({ item, onUpdate, onRemove }) => {
  const { inventory, quantity, supplier, cost: unitCost } = item || {};
  const inventoryId = String(inventory?._id || "");

  const unitCostLabel = useMemo(() => {
    return measurementLabels(inventory?.measurement).unitCost;
  }, [inventory?.measurement]);

  const unitLabel = useMemo(() => {
    return Inventory.getUnitByMeasurement(inventory?.measurement, false);
  }, [inventory?.measurement]);

  const supplierOptions = useMemo(() => {
    const options = (
      Array.isArray(inventory?.suppliers) ? inventory.suppliers : []
    )
      .map((row) => ({
        id: String(row?.supplier?._id || ""),
        label: String(row?.supplier?.name || ""),
        cost: row?.cost,
        isPrimary: Boolean(row?.isPrimary),
      }))
      .filter((option) => option.id);

    return options.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }, [inventory?.suppliers]);

  const subtotal = useMemo(() => {
    return Formatter.amount((Number(quantity) || 0) * (Number(unitCost) || 0));
  }, [quantity, unitCost]);

  const handleRemove = useCallback(() => {
    onRemove(inventoryId);
  }, [onRemove, inventoryId]);

  const handleCostChange = useCallback(
    (event) => {
      onUpdate({
        inventory,
        cost: Number(event.target.value || 0),
      });
    },
    [onUpdate, inventory],
  );

  const handleQuantityChange = useCallback(
    (event) => {
      const nextValue = event.target.value;
      onUpdate({
        inventory,
        quantity: Inventory.sanitizeQtyInp(
          inventory?.measurement,
          String(nextValue || 1),
        ),
      });
    },
    [onUpdate, inventory],
  );

  const handleDecrease = useCallback(() => {
    const qty = Math.max(1, Number(quantity || 0) - 1);

    onUpdate({
      inventory,
      quantity: qty,
    });
  }, [onUpdate, inventory, quantity]);

  const handleIncrease = useCallback(() => {
    onUpdate({
      inventory,
      quantity: Number(quantity || 0) + 1,
    });
  }, [onUpdate, inventory, quantity]);

  const handleSupplierChange = useCallback(
    (value) => {
      const selectedSupplier = supplierOptions.find(
        (option) => option.id === value,
      );

      onUpdate({
        inventory,
        cost: selectedSupplier?.cost ?? unitCost,
        supplier: value || "all",
      });
    },
    [onUpdate, inventory, supplierOptions, unitCost],
  );

  return (
    <div className="rounded-xl border border-border bg-card/60 p-2.5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {inventory?.name || "Item"}
          </p>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-xl"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-2">
        <div className="grid grid-cols-[120px_1fr] items-end gap-2">
          <div className="space-y-1 ">
            <Label className="text-xs text-muted-foreground">
              {unitCostLabel}
            </Label>

            <Input
              type="number"
              inputMode="decimal"
              min={1}
              step="0.01"
              value={unitCost ?? ""}
              onChange={handleCostChange}
            />
          </div>

          <div className="space-y-1 text-center">
            <Label className="text-xs text-muted-foreground">{unitLabel}</Label>

            <div className="flex   items-center gap-1.5 rounded-md border border-border bg-background/40 px-1.5 py-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg"
                onClick={handleDecrease}
                title="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                value={quantity ?? 1}
                onChange={handleQuantityChange}
                inputMode="numeric"
                pattern="[0-9]*"
                className="h-7 w-20 rounded-lg bg-background text-center text-sm tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg"
                onClick={handleIncrease}
                title="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-end justify-between gap-3">
            <Label className="text-xs text-muted-foreground">Supplier</Label>

            <p className="text-xs text-muted-foreground tabular-nums">
              Subtotal{" "}
              <span className="font-semibold text-foreground">{subtotal}</span>
            </p>
          </div>

          <Select
            value={supplier || "all"}
            onValueChange={handleSupplierChange}
          >
            <SelectTrigger className="h-9 w-full" data-supplier-trigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all" disabled>
                Select supplier
              </SelectItem>

              {supplierOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <span
                    className={
                      option.isPrimary
                        ? "font-semibold text-primary"
                        : "text-foreground"
                    }
                  >
                    {option.label || "Supplier"}
                  </span>

                  <span className="text-muted-foreground">
                    {" "}
                    ({Formatter.amount(option.cost)})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});

const CreateOrderCart = () => {
  const dispatch = useDispatch();
  const { cart = [] } = useSelector(({ purchases }) => purchases);
  const [search, setSearch] = useState("");

  const totals = useMemo(() => {
    const totalAmount = cart.reduce((sum, { quantity = 0, cost = 0 }) => {
      return sum + Number(quantity || 0) * Number(cost || 0);
    }, 0);

    return {
      totalItems: cart.length,
      totalAmount,
    };
  }, [cart]);

  const filteredCart = useMemo(() => {
    const safeCart = Array.isArray(cart) ? cart : [];
    const query = String(search || "")
      .trim()
      .toLowerCase();

    if (!query) return safeCart;

    return safeCart.filter((item) => {
      const name = String(item?.inventory?.name || "").toLowerCase();
      return name.includes(query);
    });
  }, [cart, search]);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleClear = useCallback(() => {
    dispatch(CartClear());
  }, [dispatch]);

  const handleUpdate = useCallback(
    (payload) => {
      dispatch(CartUpdate(payload));
    },
    [dispatch],
  );

  const handleRemove = useCallback(
    (inventoryId) => {
      dispatch(CartRemove(inventoryId));
    },
    [dispatch],
  );

  const handleReview = useCallback(() => {
    if (!cart.length) return;
    dispatch(SetReviewOpen());
  }, [dispatch, cart.length]);

  return (
    <>
      <CardHeader className="w-full space-y-1">
        <div className="min-w-0">
          <CardTitle className="text-lg">Order Details</CardTitle>
          <p className="text-xs text-muted-foreground">
            Review each item, then set the supplier, unit cost, and quantity.
          </p>
        </div>

        <CardAction>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"
            disabled={!cart.length}
            onClick={handleClear}
            title="Clear selected items"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardAction>

        <div className="col-span-2">
          <div className="relative mt-1.5 w-full">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />

            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search items..."
              className="h-8 w-full pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-1 pt-0">
        <div
          className={
            cart.length
              ? "min-h-0 flex-1 space-y-3 overflow-auto pr-1"
              : "min-h-0 flex-1 overflow-auto pr-1"
          }
        >
          {filteredCart.length ? (
            filteredCart.map((item) => {
              const inventoryId = String(item?.inventory?._id || "");

              return (
                <CartItemRow
                  key={inventoryId}
                  item={item}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              );
            })
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
              <div className="space-y-2">
                {cart.length && String(search || "").trim() ? (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      No matching items
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try a different keyword.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      No selected items yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click any row in the list to select items for ordering.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3 pt-3">
          <Separator />

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Items</span>
              <span className="font-semibold text-foreground">
                {totals.totalItems}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Est. total</span>
              <span className="font-semibold text-foreground">
                {Formatter.amount(totals.totalAmount)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={!cart.length}
            onClick={handleReview}
          >
            <ClipboardList className="h-4 w-4" />
            Review Order
          </Button>
        </div>
      </CardContent>
    </>
  );
};

export default CreateOrderCart;
