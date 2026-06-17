import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
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
  INVENTORY_TYPE_OPTIONS,
  INVENTORY_CATEGORY_OPTIONS,
  getInventoryCost,
  getUnitOptions,
  isPieceUnit,
  resolveUnitValue,
} from "../../addOns/modal/utils";

const INVALID_NUMBER_KEYS = ["e", "E", "+", "-", ".", ","];

const Recipe = ({ form, setForm = () => {}, isFullEdit = false }) => {
  const { collections: inventoryItems = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const [filters, setFilters] = useState(() => ({
    ...INITIAL_FILTERS,
    // In prepared recipe setup, default to ingredients. User can switch to resell.
    type: "ingredient",
  }));

  const selectedIngredientRows = useMemo(() => {
    const ingredients = Array.isArray(form?.ingredients)
      ? form.ingredients
      : [];

    return ingredients.map((entry, index) => {
      const linkedItem =
        inventoryItems.find((item) => item?._id === entry.inventory) || null;
      const unitOptions = getUnitOptions(linkedItem?.measurement);
      const selectedUnit = resolveUnitValue(
        unitOptions,
        entry.unit,
        linkedItem?.measurement,
      );
      const estimatedCost = getInventoryCost(
        entry.qtyPerOrder,
        selectedUnit,
        linkedItem,
      );

      return {
        index,
        ...entry,
        unit: selectedUnit,
        linkedItem,
        unitOptions,
        estimatedCost,
      };
    });
  }, [form?.ingredients, inventoryItems]);

  const selectedInventoryIds = useMemo(() => {
    return selectedIngredientRows
      .map((entry) => entry.inventory)
      .filter(Boolean);
  }, [selectedIngredientRows]);

  const totalEstimatedInventoryCost = useMemo(() => {
    return selectedIngredientRows.reduce(
      (total, entry) => total + (entry.estimatedCost || 0),
      0,
    );
  }, [selectedIngredientRows]);

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
        // When switching between Ingredient / Resell, reset category so it matches the new type.
        return { ...prev, type: value, category: "all" };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const categoryOptions = useMemo(() => {
    return (
      INVENTORY_CATEGORY_OPTIONS[filters.type] || INVENTORY_CATEGORY_OPTIONS.all
    );
  }, [filters.type]);

  const toggleInventoryItem = (item) => {
    if (!item?._id) return;

    if (selectedInventoryIds.includes(item._id)) {
      setForm((current) => ({
        ...current,
        ingredients: (current.ingredients || []).filter(
          (entry) => entry.inventory !== item._id,
        ),
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      ingredients: [
        {
          inventory: item._id,
          qtyPerOrder: 1,
          unit: getUnitOptions(item.measurement)[0]?.value || null,
        },
        ...(current.ingredients || []),
      ],
    }));
  };

  const removeIngredientRow = (index) => {
    setForm((current) => ({
      ...current,
      ingredients: (current.ingredients || []).filter(
        (_, rowIndex) => rowIndex !== index,
      ),
    }));
  };

  const updateIngredientQty = (index, value) => {
    setForm((current) => ({
      ...current,
      ingredients: (current.ingredients || []).map((entry, rowIndex) =>
        rowIndex === index
          ? {
              ...entry,
              qtyPerOrder: isPieceUnit(entry.unit)
                ? value.replace(/[^0-9]/g, "")
                : value,
            }
          : entry,
      ),
    }));
  };

  const updateIngredientUnit = (index, value) => {
    setForm((current) => ({
      ...current,
      ingredients: (current.ingredients || []).map((entry, rowIndex) =>
        rowIndex === index
          ? {
              ...entry,
              unit: value,
              qtyPerOrder: isPieceUnit(value)
                ? String(
                    Math.max(1, Math.round(Number(entry.qtyPerOrder) || 1)),
                  )
                : entry.qtyPerOrder,
            }
          : entry,
      ),
    }));
  };

  const handleIngredientQtyKeyDown = (event, unit) => {
    if (!isPieceUnit(unit)) return;
    if (INVALID_NUMBER_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  };

  if (isFullEdit && !form?.setupRecipe) {
    return (
      <section className="rounded-[15px] border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Recipe Setup</p>
            <p className="text-xs text-muted-foreground">
              Select the inventory ingredients used to prepare one serving of
              this menu item.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, setupRecipe: true }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                form?.setupRecipe
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up now
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  setupRecipe: false,
                  ingredients: [],
                }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !form?.setupRecipe
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up later
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[15px] border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Recipe Setup</p>
          <p className="text-xs text-muted-foreground">
            Select the inventory ingredients used to prepare one serving of this
            menu item.
          </p>
        </div>

        {isFullEdit ? (
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, setupRecipe: true }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                form?.setupRecipe
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up now
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  setupRecipe: false,
                  ingredients: [],
                }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !form?.setupRecipe
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up later
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1.05fr_auto_0.95fr] xl:items-stretch">
        <div className="flex h-[472px] max-h-[472px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border">
          <div className="space-y-1 border-b border-border px-4 py-3">
            <p className="text-base font-semibold text-foreground">
              Select Ingredients
            </p>
            <p className="text-sm text-muted-foreground">
              Search inventory items and add the ingredients used for this
              recipe.
            </p>
          </div>

          <div className="min-h-0 flex flex-1 flex-col space-y-3 p-3">
            <div className="flex gap-3">
              {/* SEARCH - takes remaining space */}
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9"
                />
              </div>

              {/* TYPE */}
              <div className="w-[120px] shrink-0">
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger className="w-full bg-transparent">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_TYPE_OPTIONS.filter(
                      (o) => o.value !== "all",
                    ).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CATEGORY */}
              <div className="w-[135px] shrink-0">
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
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

	            <div className="min-h-0 flex-1 overflow-auto rounded-[10px] border border-border">
	              {filteredInventoryItems.length ? (
	                filteredInventoryItems.map((item) => {
	                  const isSelected = selectedInventoryIds.includes(item._id);
	
	                  return (
	                    <button
	                      key={item._id}
	                      type="button"
	                      onClick={() => toggleInventoryItem(item)}
	                      className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 ${
	                        isSelected
	                          ? "border-l-4 border-l-primary bg-[color:color-mix(in_srgb,var(--color-primary)_8%,white)]"
	                          : "hover:bg-muted/15"
	                      }`}
	                    >
	                      <div className="min-w-0 space-y-1.5">
	                        <p className="truncate text-sm font-semibold text-foreground">
	                          {item.name}
	                        </p>
	                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
	                          <span className="capitalize">{item.category}</span>
	                          <span className="text-border">&middot;</span>
	                          <span className="capitalize">{item.type}</span>
	                        </div>
	                      </div>
	
	                      <div className="text-right">
	                        <p className="text-sm font-semibold text-foreground">
	                          {Formatter.amount(item.cost || 0)}
	                        </p>
	                        <p
	                          className={`text-xs font-medium ${
	                            isSelected
	                              ? "text-primary"
	                              : "text-muted-foreground"
	                          }`}
	                        >
	                          {isSelected ? "Added" : "Add"}
	                        </p>
	                      </div>
	                    </button>
	                  );
	                })
	              ) : (
	                <div className="flex h-full min-h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
	                  No inventory items matched your search.
	                </div>
	              )}
            </div>
          </div>
        </div>

        <div className="hidden items-center justify-center xl:flex">
          <div className="flex h-full items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="flex h-[472px] max-h-[472px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border">
          <div className="border-b border-border bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Selected Ingredients
                </p>
                <p className="text-sm text-muted-foreground">
                  Build your recipe by adding ingredients and setting their
                  quantity.
                </p>
              </div>
              <div className="flex min-w-[72px] flex-col items-center justify-center rounded-lg border border-border px-3 py-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Items
                </p>
                <p className="text-base font-semibold text-foreground">
                  {selectedIngredientRows?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3">
            {selectedIngredientRows.length ? (
              <div className="space-y-2">
                {selectedIngredientRows.map((entry) => (
                  <div
                    key={`${entry.inventory}-${entry.index}`}
                    className="rounded-xl border border-border px-4 py-3"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-base font-semibold text-foreground">
                            {entry?.linkedItem?.name || "Unknown item"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry?.linkedItem?.category
                              ? String(entry.linkedItem.category)
                              : "Ingredient"}
                          </p>
                        </div>
                        <div className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-center">
                          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            COST / SERVE
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {Formatter.amount(entry.estimatedCost || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-[120px_auto] items-start gap-3 border-t border-border/70 pt-3">
                        <div className="flex flex-col justify-start gap-1 self-start bg-card">
                          <Label className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            Qty / Serve
                          </Label>
                          <Input
                            value={entry.qtyPerOrder}
                            onKeyDown={(event) =>
                              handleIngredientQtyKeyDown(event, entry.unit)
                            }
                            onChange={(event) =>
                              updateIngredientQty(
                                entry.index,
                                event.target.value,
                              )
                            }
                            className="h-9 border-border bg-transparent px-2 text-center text-sm"
                          />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                          <div className="flex flex-col gap-1 ">
                            <Label className="text-[11px] font-medium uppercase tracking-[0.08em]  text-muted-foreground">
                              Unit
                            </Label>
                            <Select
                              value={entry.unit}
                              onValueChange={(value) =>
                                updateIngredientUnit(entry.index, value)
                              }
                            >
                              <SelectTrigger className="h-9 bg-card">
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

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeIngredientRow(entry.index)}
                              className="h-9 border-border bg-transparent px-3 text-xs font-medium text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border px-6 text-center text-sm text-muted-foreground">
                Selected ingredients will appear here.
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm">
              <span className="font-medium text-muted-foreground">
                Total estimated recipe cost
              </span>
              <span className="text-lg font-semibold text-primary">
                {Formatter.amount(totalEstimatedInventoryCost)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recipe;
