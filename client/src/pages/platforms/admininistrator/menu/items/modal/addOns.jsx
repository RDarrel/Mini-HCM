import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

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

const GROUP_FILTERS = [
  { value: "all", label: "All" },
  { value: "extras", label: "Extras" },
  { value: "toppings", label: "Toppings" },
  { value: "sides", label: "Sides" },
  { value: "drinks", label: "Drinks" },
];

const normalizeId = (value) => String(value || "").trim();

const RecommendedAddOns = ({
  collections = [],
  enabled = false,
  hideToggle = false,
  onEnabledChange,
  selectedIds = [],
  onSelectedIdsChange,
}) => {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const normalizedSelectedIds = useMemo(
    () => (Array.isArray(selectedIds) ? selectedIds.map(normalizeId) : []),
    [selectedIds],
  );

  const selectedSet = useMemo(
    () => new Set(normalizedSelectedIds.filter(Boolean)),
    [normalizedSelectedIds],
  );

  const filteredAddOns = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (collections || []).filter((item) => {
      if (!item?._id) return false;
      if (activeGroup !== "all" && item?.group !== activeGroup) return false;

      return (
        !keyword ||
        item?.name?.toLowerCase().includes(keyword) ||
        item?.description?.toLowerCase().includes(keyword)
      );
    });
  }, [activeGroup, collections, search]);

  const selectedAddOns = useMemo(() => {
    if (!normalizedSelectedIds.length) return [];

    const addOnMap = new Map(
      (collections || []).map((item) => [normalizeId(item?._id), item]),
    );

    return normalizedSelectedIds
      .map((id) => addOnMap.get(normalizeId(id)))
      .filter(Boolean);
  }, [collections, normalizedSelectedIds]);

  const groupCounts = useMemo(() => {
    return GROUP_FILTERS.reduce((accumulator, group) => {
      accumulator[group.value] =
        group.value === "all"
          ? (collections || []).length
          : (collections || []).filter((item) => item.group === group.value)
              .length;
      return accumulator;
    }, {});
  }, [collections]);

  const toggleAddOn = (item) => {
    const id = normalizeId(item?._id);
    if (!id) return;

    if (selectedSet.has(id)) {
      onSelectedIdsChange(normalizedSelectedIds.filter((entry) => entry !== id));
      return;
    }

    onSelectedIdsChange([...normalizedSelectedIds, id]);
  };

  const shouldShowBody = hideToggle || enabled;

  return (
    <section className="rounded-[15px] border border-border bg-white shadow-sm">
      <div
        className={`flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between ${
          shouldShowBody ? "border-b border-border" : ""
        }`}
      >
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-foreground">
            Recommended Add-Ons
          </Label>
          <p className="text-xs text-muted-foreground">
            Suggest optional add-ons that pair well with this menu item.
          </p>
        </div>

        {!hideToggle ? (
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => onEnabledChange(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                enabled
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up now
            </button>
            <button
              type="button"
              onClick={() => onEnabledChange(false)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !enabled
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up later
            </button>
          </div>
        ) : null}
      </div>

      {shouldShowBody ? (
        <div className="space-y-4 p-4">
          <div className="grid gap-4 xl:grid-cols-[1.05fr_auto_0.95fr] xl:items-stretch">
            <div className="flex h-[420px] max-h-[420px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border">
              <div className="space-y-3 border-b border-border px-4 py-3">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    Available Add-Ons
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click an add-on to include it as a recommended option.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_200px] md:items-center">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search add-ons..."
                      className="pl-9"
                    />
                  </div>

                  <Select value={activeGroup} onValueChange={setActiveGroup}>
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_FILTERS.map((group) => {
                        const count = groupCounts[group.value];

                        return (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                {filteredAddOns.length ? (
                  filteredAddOns.map((item) => {
                    const id = normalizeId(item._id);
                    const isSelected = selectedSet.has(id);

                    return (
                      <div
                        key={id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleAddOn(item)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleAddOn(item);
                          }
                        }}
                        className={`flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 last:border-b-0 ${
                          isSelected
                            ? "cursor-pointer bg-[color:color-mix(in_srgb,var(--primary)_7%,white)] shadow-[inset_4px_0_0_var(--color-primary)] hover:bg-[color:color-mix(in_srgb,var(--primary)_10%,white)]"
                            : "cursor-pointer bg-transparent transition-colors hover:bg-muted/40"
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item?.name || "Untitled add-on"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{item?.group}</span>
                            <span className="text-border">&middot;</span>
                            <span className="font-medium text-foreground">
                              {Formatter.amount(Number(item?.price || 0))}
                            </span>
                          </div>
                          {item?.description ? (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleAddOn(item);
                          }}
                          className={`shrink-0 text-xs font-medium ${
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isSelected ? "Added" : "Add"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    No add-ons matched your filters.
                  </div>
                )}
              </div>
            </div>

            <div className="hidden xl:flex xl:h-full xl:items-center xl:justify-center">
              <div className="relative flex h-full min-h-[280px] items-center justify-center px-1">
                <div className="absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 bg-border" />
                <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex h-[420px] max-h-[420px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      Selected Add-Ons
                    </p>
                    <p className="text-sm text-muted-foreground">
                      These add-ons will show as recommended for this menu item.
                    </p>
                  </div>
                  <div className="flex min-w-[72px] flex-col items-center justify-center rounded-lg border border-border px-3 py-2 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Items
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {selectedAddOns.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-3">
                {selectedAddOns.length ? (
                  <div className="space-y-3">
                    {selectedAddOns.map((item) => {
                      const id = normalizeId(item._id);

                      return (
                        <div
                          key={id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {item?.name || "Untitled add-on"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{item?.group}</span>
                              <span className="text-border">&middot;</span>
                              <span className="font-medium text-foreground">
                                {Formatter.amount(Number(item?.price || 0))}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleAddOn(item)}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    No selected add-ons yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default RecommendedAddOns;
