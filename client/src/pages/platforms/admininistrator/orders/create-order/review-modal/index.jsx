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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartClear,
  SAVE,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter, Inventory } from "@/services/utilities";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReviewOrderItemsList from "./items-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";
const ReviewOrderModal = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);
  const { collections: suppliers } = useSelector(({ suppliers }) => suppliers);
  const { cart, formSubmitted } = useSelector(({ purchases }) => purchases);
  const [formattedCart, setFormattedCart] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [itemSearch, setItemSearch] = useState("");

  const [draftQtyById, setDraftQtyById] = useState({});

  const { reviewOpen } = useSelector(({ purchases }) => purchases);

  const supplierLabelById = useMemo(() => {
    const map = new Map();
    for (const option of Array.isArray(suppliers) ? suppliers : []) {
      if (option?._id)
        map.set(String(option._id), String(option.name || "Supplier"));
    }
    return map;
  }, [suppliers]);
  const totalAmount = (Array.isArray(cart) ? cart : []).reduce((sum, entry) => {
    const id = String(entry?.inventory?._id || "");

    const displayQty = Number(draftQtyById[id] ?? entry.quantity) || 0;
    const unitCost = Number(entry?.cost) || 0;

    return sum + displayQty * unitCost;
  }, 0);

  const formatDate = (date) => {
    if (!date) return null;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date(date))
      .replace(/\//g, "-");
  };

  const getDefaultDeliveryWindow = () => {
    const now = new Date();

    const from = new Date(now);
    from.setDate(from.getDate() + 1);

    const to = new Date(now);
    to.setDate(to.getDate() + 3);

    return {
      from: formatDate(from),
      to: formatDate(to),
    };
  };

  useEffect(() => {
    if (!reviewOpen) return;

    const groupsMap = new Map();

    cart.forEach((item) => {
      const key = item?.supplier;

      if (!groupsMap.has(key)) {
        const defaultWindow = getDefaultDeliveryWindow();

        groupsMap.set(key, {
          supplier: key,
          items: [],
          ...(!Object.values(item?.deliveryWindow || {})?.length && {
            deliveryWindow: {
              from:
                formatDate(item?.deliveryWindow?.from) || defaultWindow.from,
              to: formatDate(item?.deliveryWindow?.to) || defaultWindow.to,
            },
          }),
        });
      }

      groupsMap.get(key).items.push(item);
    });

    const result = Array.from(groupsMap.values()).map((group) => {
      const totalAmount = group.items.reduce((sum, item) => {
        const unitCost = Number(item?.cost) || 0;
        const qty = Number(item?.quantity) || 0;
        return sum + unitCost * qty;
      }, 0);

      return {
        ...group,
        totalAmount,
      };
    });

    setFormattedCart(result);
  }, [cart, reviewOpen]);

  useEffect(() => {
    if (!reviewOpen) return;
    setSupplierFilter("all");
    setItemSearch("");
  }, [reviewOpen]);

  const supplierFilterOptions = useMemo(() => {
    return (Array.isArray(formattedCart) ? formattedCart : [])
      .map((group) => String(group?.supplier || ""))
      .filter(Boolean);
  }, [formattedCart]);

  useEffect(() => {
    if (supplierFilter === "all") return;
    if (!supplierFilterOptions.includes(supplierFilter)) {
      setSupplierFilter("all");
    }
  }, [supplierFilter, supplierFilterOptions]);

  const visibleGroups = useMemo(() => {
    const query = String(itemSearch || "")
      .trim()
      .toLowerCase();
    const baseGroups =
      supplierFilter !== "all"
        ? (Array.isArray(formattedCart) ? formattedCart : []).filter(
            (group) => String(group?.supplier || "") === supplierFilter,
          )
        : Array.isArray(formattedCart)
          ? formattedCart
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

        const totalAmount = items.reduce((sum, item) => {
          const unitCost = Number(item?.cost) || 0;
          const qty = Number(item?.quantity) || 0;
          return sum + unitCost * qty;
        }, 0);

        return { ...group, items, totalAmount };
      })
      .filter((group) => (group?.items || []).length);
  }, [formattedCart, itemSearch, supplierFilter]);

  const handleDateChange = (newDate, supplier) => {
    const _formattedCart = [...formattedCart];
    const groupIndex = _formattedCart.findIndex(
      (group) => group.supplier === supplier,
    );
    if (groupIndex !== -1) {
      _formattedCart[groupIndex] = {
        ..._formattedCart[groupIndex],
        deliveryWindow: newDate,
      };
    }
    setFormattedCart(_formattedCart);
  };

  const close = (nextOpen) => dispatch(SetReviewOpen(Boolean(nextOpen)));
  const placeOrder = (e) => {
    e.preventDefault();
    const _cart = [...cart].map((c) => ({
      ...c,
      inventory: c?.inventory?._id,
      unit: Inventory.getUnitByMeasurement(
        c?.inventory?.measurement,
      )?.toLowerCase(),
      quantity: {
        incoming: Number(c.quantity) || 0,
      },
    }));
    const purchases = formattedCart.map((group) => ({
      supplier: group.supplier,
      deliveryWindow: group.deliveryWindow,
      totalAmount: group.totalAmount,
      status: "incoming",
    }));

    dispatch(SAVE({ data: { cart: _cart, purchases }, token }))
      .unwrap()
      .then(() => {
        setDraftQtyById({});
        setFormattedCart([]);
        setSupplierFilter("all");
        setItemSearch("");
        dispatch(CartClear());
        close(false);
        toast.success("Order placed successfully.");
      })
      .catch((error) => {
        toast.error("Failed to place order. Please try again.");
        console.error("Error placing order:", error);
      });
  };

  return (
    <Dialog open={reviewOpen} onOpenChange={close}>
      <DialogContent
        className="max-w-4xl p-1 "
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
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
                        Review order
                      </DialogTitle>
                      <DialogDescription className="hidden text-sm leading-snug sm:block">
                        Double-check items, quantities, and delivery windows
                        before placing the order.
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-auto px-5 mt-4 ">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
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

                  <div className="w-full">
                    <Label className="text-xs text-muted-foreground">
                      Supplier
                    </Label>
                    <Select
                      value={supplierFilter}
                      onValueChange={setSupplierFilter}
                    >
                      <SelectTrigger className="mt-1 h-10 w-full">
                        <SelectValue placeholder="All suppliers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All suppliers</SelectItem>
                        {supplierFilterOptions.map((supplierId) => (
                          <SelectItem key={supplierId} value={supplierId}>
                            {supplierLabelById.get(supplierId) || "Supplier"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {visibleGroups.length ? (
                <div className="space-y-3">
                  {visibleGroups.map((group) => (
                    <SupplierRaw
                      key={group.supplier}
                      group={group}
                      supplierLabelById={supplierLabelById}
                      handleDateChange={handleDateChange}
                      setDraftQtyById={setDraftQtyById}
                      draftQtyById={draftQtyById}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      No matching items
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try a different supplier or search term.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border bg-background/80 px-5 mt-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">Items</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {cart.length}
                  </span>
                </div>
                <span className="h-4 w-px bg-border/70" aria-hidden="true" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Suppliers
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formattedCart.length}
                  </span>
                </div>
                <span className="h-4 w-px bg-border/70" aria-hidden="true" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Total Amount
                  </span>
                  <span className="text-base font-semibold leading-none tabular-nums text-foreground">
                    {Formatter.amount(totalAmount)}
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
                <Button type="submit" disabled={formSubmitted}>
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

export default ReviewOrderModal;

const SupplierRaw = memo(
  ({
    group,
    supplierLabelById,
    handleDateChange,
    draftQtyById,
    setDraftQtyById,
  }) => {
    const { deliveryWindow } = group;
    const itemsCount = (Array.isArray(group?.items) ? group.items : []).length;

    const toDate = (value) => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      const maybeDate = new Date(value);
      return Number.isNaN(maybeDate.getTime()) ? undefined : maybeDate;
    };

    const safeDeliveryWindow = {
      from: toDate(deliveryWindow?.from),
      to: toDate(deliveryWindow?.to),
    };
    return (
      <div
        key={group.supplier}
        className="rounded-xl border border-border bg-card/60 p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-foreground">
                {supplierLabelById.get(group.supplier) || "Supplier"}
              </p>
              <Badge variant="secondary" className="rounded-full">
                {itemsCount} item(s)
              </Badge>
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {Formatter.amount(group.totalAmount)}
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
        <ReviewOrderItemsList
          rows={group.items}
          setDraftQtyById={setDraftQtyById}
          draftQtyById={draftQtyById}
        />
      </div>
    );
  },
);
