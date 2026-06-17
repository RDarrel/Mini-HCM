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
  CartClear,
  CartRemove,
  CartUpdate,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/stock-requests";
import { Inventory, Stock } from "@/services/utilities";
import { ClipboardList, Minus, Plus, Search, Trash2 } from "lucide-react";
import { capitalize } from "lodash";

const CartItemRow = memo(({ item, onUpdate, onRemove }) => {
  const { inventory, quantity } = item || {};
  const inventoryId = String(inventory?._id || "");
  const stockStatus = String(inventory?.stockStatus || "").trim();
  const stockStatusLabel = stockStatus ? capitalize(stockStatus) : "";
  const currentStockLabel = Stock.display(
    inventory?.stockDisplay?.current,
    inventory?.measurement,
  );

  const stockStatusTone = useMemo(() => {
    const normalized = stockStatus.toLowerCase();
    if (normalized === "out of stock") return "text-destructive/90";
    if (normalized === "low stock") return "text-amber-700/90";
    return "text-muted-foreground";
  }, [stockStatus]);

  const unitLabel = useMemo(() => {
    return Inventory.getUnitByMeasurement(inventory?.measurement);
  }, [inventory?.measurement]);

  const handleRemove = useCallback(() => {
    onRemove(inventoryId);
  }, [onRemove, inventoryId]);

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

  return (
    <div className="rounded-xl border border-border bg-card/60 p-2.5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {inventory?.name || "Item"}
          </p>
          <p className="mt-1 text-xs leading-4 text-muted-foreground">
            {stockStatusLabel ? (
              <>
                <span className={`font-medium ${stockStatusTone}`}>
                  {stockStatusLabel}
                </span>
              </>
            ) : null}
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

      <div className="mt-3 border-t border-border/60 pt-1">
        <div className="grid gap-3 sm:grid-cols-[110px_1fr] sm:items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Available Stock
            </Label>
            <Input
              disabled
              value={currentStockLabel}
              className="h-9 w-full bg-muted/20 font-normal tabular-nums text-foreground disabled:opacity-90"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Request{" "}
              <span className="font-medium text-muted-foreground">
                ({unitLabel})
              </span>
            </Label>

            <div className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-1.5">
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
                className="h-7 w-full max-w-[120px] rounded-lg bg-background text-center text-sm tabular-nums  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
      </div>
    </div>
  );
});

const RequestStockCart = () => {
  const dispatch = useDispatch();
  const { cart = [] } = useSelector(({ stockRequests }) => stockRequests);
  const [search, setSearch] = useState("");

  const totals = useMemo(() => {
    const totalQty = cart.reduce((sum, { quantity = 0 }) => {
      return sum + (Number(quantity) || 0);
    }, 0);

    return {
      totalItems: cart.length,
      totalQty,
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
          <CardTitle className="text-lg">Stock Request</CardTitle>
          <p className="text-xs text-muted-foreground">
            Review selected items and enter the quantities to request.
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
                      Click any item from the list to add it to your request.
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
              <span className="text-muted-foreground">Total Items:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {totals.totalItems}
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
            Review Request
          </Button>
        </div>
      </CardContent>
    </>
  );
};

export default RequestStockCart;
