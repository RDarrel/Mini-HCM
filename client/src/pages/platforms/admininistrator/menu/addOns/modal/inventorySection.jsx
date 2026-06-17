import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Formatter } from "@/services/utilities";
import {
  INITIAL_FILTERS,
  INVENTORY_CATEGORY_OPTIONS,
  INVENTORY_TYPE_OPTIONS,
} from "./utils";

const AddOnInventorySection = ({
  usesInventory,
  onUsesInventoryChange,
  onToggleInventoryItem,
  selectedIngredientRows,
  onUpdateIngredientQty,
  onUpdateIngredientUnit,
  onRemoveIngredientRow,
  totalEstimatedInventoryCost,
  isPieceUnit,
  onIngredientQtyKeyDown,
}) => {
  const { collections: inventoryItems = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const selectedInventoryIds = useMemo(
    () =>
      selectedIngredientRows.map((entry) => entry.inventory).filter(Boolean),
    [selectedIngredientRows],
  );

  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesType =
        filters.type === "all" ? true : item?.type === filters.type;
      const matchesCategory =
        filters.category === "all" ? true : item?.category === filters.category;
      const matchesSearch = filters.search
        ? item?.name?.toLowerCase().includes(filters.search.toLowerCase())
        : true;

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [filters, inventoryItems]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      if (key === "type") {
        return {
          ...prev,
          type: value,
          category: "all",
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-foreground">
            Uses Inventory
          </Label>
          <p className="text-xs text-muted-foreground">
            Choose yes if this add-on deducts stock from one or more inventory
            items.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => onUsesInventoryChange(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              usesInventory
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onUsesInventoryChange(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              !usesInventory
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {usesInventory ? (
        <div className="mt-4 grid gap-4 border-t border-border pt-4 xl:grid-cols-[1.05fr_auto_0.95fr] xl:items-stretch">
          <div className="flex h-[472px] max-h-[472px] flex-col overflow-hidden rounded-2xl border border-border">
            <div className="space-y-1 border-b border-border px-4 py-3">
              <p className="text-base font-semibold text-foreground">
                Select Ingredients
              </p>
              <p className="text-sm text-muted-foreground">
                Search inventory items and add the ingredients used for this
                add-on.
              </p>
            </div>

            <div className="min-h-0 flex flex-1 flex-col space-y-3 p-3">
              <div className="grid gap-3 md:grid-cols-12">
                <div className="relative md:col-span-5">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={filters.search}
                    onChange={(event) =>
                      handleFilterChange("search", event.target.value)
                    }
                    placeholder="Search inventory items..."
                    className="pl-9"
                  />
                </div>

                <div className="md:col-span-3">
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVENTORY_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-4">
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      handleFilterChange("category", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        INVENTORY_CATEGORY_OPTIONS[filters.type] ||
                        INVENTORY_CATEGORY_OPTIONS.all
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto rounded-[10px] border border-border bg-card">
                {filteredInventoryItems.length ? (
                  filteredInventoryItems.map((item) => {
                    const isSelected = selectedInventoryIds.includes(item._id);

                    return (
                      <div
                        key={item._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onToggleInventoryItem(item)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onToggleInventoryItem(item);
                          }
                        }}
                        className={`flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 last:border-b-0 ${
                          isSelected
                            ? "cursor-default bg-[color:color-mix(in_srgb,var(--primary)_7%,white)] shadow-[inset_4px_0_0_var(--color-primary)]"
                            : "cursor-pointer bg-card transition hover:bg-muted/40"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{item.category}</span>
                            <span className="text-border">&middot;</span>
                            <span className="capitalize">{item.type}</span>
                            <span className="text-border">&middot;</span>
                            <span>
                              {item.measurement === "weight"
                                ? "Weight"
                                : item.measurement === "volume"
                                  ? "Volume"
                                  : "Pieces"}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {Formatter.amount(item.cost || 0)}
                          </p>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleInventoryItem(item);
                            }}
                            className={`text-xs font-medium ${
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {isSelected ? "Added" : "Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    No inventory items matched your filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden xl:flex xl:h-full xl:items-center xl:justify-center">
            <div className="relative flex h-full min-h-[360px] items-center justify-center px-1">
              <div className="absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 bg-border" />
              <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex h-[472px] max-h-[472px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    Selected Items
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Set the ingredient amount used for each add-on serving.
                  </p>
                </div>
                <div className="flex min-w-[72px] flex-col items-center justify-center rounded-lg border border-border px-3 py-2 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Items
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {selectedIngredientRows.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-3">
              {selectedIngredientRows.length ? (
                <div className="space-y-3">
                  {selectedIngredientRows.map((entry) => (
                    <div
                      key={`${entry.index}-${entry.inventory}`}
                      className="rounded-xl border border-border px-4 py-3"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-base font-semibold text-foreground">
                              {entry.linkedItem?.name || "Unknown item"}
                            </p>
                          </div>
                          <div className="shrink-0 rounded-lg border border-border bg-transparent px-3 py-1.5 text-center">
                            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                              Estimated Cost
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {Formatter.amount(entry.estimatedCost || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-[96px_96px_auto] items-start gap-3 border-t border-border/70 pt-3">
                          <div className="flex flex-col justify-start gap-1 self-start">
                            <Label className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                              Per Serve Qty
                            </Label>
                            <Input
                              type="number"
                              min={isPieceUnit(entry.unit) ? "1" : "0.01"}
                              step={isPieceUnit(entry.unit) ? "1" : "0.01"}
                              value={entry.qtyPerOrder}
                              onKeyDown={(event) =>
                                onIngredientQtyKeyDown(event, entry.unit)
                              }
                              onChange={(event) =>
                                onUpdateIngredientQty(
                                  entry.index,
                                  event.target.value,
                                )
                              }
                              placeholder="1"
                              className="h-9 border-border bg-transparent px-2 text-center text-sm"
                            />
                          </div>

                          <div className="flex flex-col justify-start gap-1 self-start">
                            <Label className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                              Per Serve Unit
                            </Label>
                            <Select
                              value={entry.unit}
                              onValueChange={(value) =>
                                onUpdateIngredientUnit(entry.index, value)
                              }
                            >
                              <SelectTrigger className="h-9 w-full border-border bg-transparent px-2 text-xs">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {entry.unitOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex self-end justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => onRemoveIngredientRow(entry.index)}
                              className="h-9 border-border bg-transparent px-3 text-xs font-medium text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border px-6 text-center text-sm text-muted-foreground">
                  Selected inventory items will appear here.
                </div>
              )}
            </div>

            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm">
                <span className="font-medium text-muted-foreground">
                  Total estimated inventory cost
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {Formatter.amount(totalEstimatedInventoryCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddOnInventorySection;
