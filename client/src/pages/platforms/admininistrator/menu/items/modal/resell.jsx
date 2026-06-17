import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Formatter } from "@/services/utilities";
import { INVENTORY_CATEGORY_OPTIONS, getUnitOptions } from "../../addOns/modal/utils";

const Resell = ({ form, setForm = () => {}, isFullEdit = false }) => {
  const { collections: inventoryItems = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const selectedResellRow = useMemo(() => {
    const selected = Array.isArray(form?.ingredients) ? form.ingredients[0] : null;
    if (!selected?.inventory) return null;
    const linkedItem =
      inventoryItems.find((item) => item?._id === selected.inventory) || null;
    return {
      ...selected,
      linkedItem,
    };
  }, [form?.ingredients, inventoryItems]);

  const filteredInventoryItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return inventoryItems.filter((item) => {
      if (item?.type !== "resell") return false;
      if (category !== "all" && item?.category !== category) return false;

      return (
        !keyword ||
        item?.name?.toLowerCase().includes(keyword) ||
        item?.category?.toLowerCase().includes(keyword)
      );
    });
  }, [category, inventoryItems, search]);

  const selectResellItem = (item) => {
    if (!item?._id) return;
    const unitOptions = getUnitOptions(item.measurement);

    setForm((current) => ({
      ...current,
      ingredients:
        current.ingredients?.[0]?.inventory === item._id
          ? []
          : [
              {
                inventory: item._id,
                qtyPerOrder: 1,
                unit: unitOptions[0]?.value || null,
              },
            ],
    }));
  };

  const removeResellItem = () => {
    setForm((current) => ({
      ...current,
      ingredients: [],
    }));
  };

  if (isFullEdit && !form?.setupResellLink) {
    return (
      <section className="rounded-[15px] border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Resell Link</p>
            <p className="text-xs text-muted-foreground">
              Choose one resell inventory item that should deduct stock for this
              menu item.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, setupResellLink: true }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                form?.setupResellLink
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
                  setupResellLink: false,
                  ingredients: [],
                }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !form?.setupResellLink
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
          <p className="text-sm font-semibold text-foreground">Resell Link</p>
          <p className="text-xs text-muted-foreground">
            Choose one resell inventory item that should deduct stock for this
            menu item.
          </p>
        </div>

        {isFullEdit ? (
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, setupResellLink: true }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                form?.setupResellLink
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
                  setupResellLink: false,
                  ingredients: [],
                }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !form?.setupResellLink
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up later
            </button>
          </div>
        ) : null}
      </div>

      <div
        className={`min-w-0 p-4 ${
          selectedResellRow ? "" : "flex h-[472px] max-h-[472px] flex-col overflow-hidden"
        }`}
      >
        <div className={selectedResellRow ? "" : "min-h-0 flex-1 overflow-auto"}>
          {selectedResellRow ? (
            <div className="rounded-[10px] border border-border px-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-base font-semibold text-foreground">
                      {selectedResellRow?.linkedItem?.name || "Unknown item"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">
                        {selectedResellRow?.linkedItem?.category}
                      </span>
                      <span className="text-border">&middot;</span>
                      <span>Auto deducts 1 pc per sale</span>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      COST
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {Formatter.amount(selectedResellRow?.linkedItem?.cost || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-border/70 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={removeResellItem}
                    className="h-9 border-border bg-transparent px-3 text-xs font-medium text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  >
                    Remove link
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col space-y-3 p-1">
              <div className="mt-1 grid gap-3 sm:gap-2 md:grid-cols-[minmax(0,1fr)_190px] md:items-center">
                <div className="relative min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search inventory items..."
                    className="w-full pl-9"
                  />
                </div>

                <div className="min-w-0 md:w-[190px]">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVENTORY_CATEGORY_OPTIONS.resell.map((option) => (
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
                  filteredInventoryItems.map((item) => (
                    <div
                      key={item._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectResellItem(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectResellItem(item);
                        }
                      }}
                      className="flex cursor-pointer items-center justify-between gap-3 border-b border-border px-3 py-2.5 transition last:border-b-0 hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {item.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{item.category}</span>
                          <span className="text-border">&middot;</span>
                          <span className="capitalize">{item.type}</span>
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
                            selectResellItem(item);
                          }}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full min-h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    No resell inventory items matched your search.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Resell;
