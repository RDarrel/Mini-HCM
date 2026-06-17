import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/services/fakeDB";
import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

const getBundleItemId = (item) => item?._id || item?.id;
const INVALID_NUMBER_KEYS = ["e", "E", "+", "-", "."];

const Bundles = ({ form, setForm = () => {}, isFullEdit = false }) => {
  const { collections } = useSelector(({ menus }) => menus);
  const { collections: categories } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const [bundleSearch, setBundleSearch] = useState("");
  const [bundleCategory, setBundleCategory] = useState("All");
  const bundleCandidates = collections.filter((item) => item.type !== "bundle");
  const totalEstimatedBundleCost = (form.bundleItems || []).reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const filteredBundleItems = bundleCandidates.filter((item) => {
    const keyword = bundleSearch.trim().toLowerCase();
    const matchesCategory =
      bundleCategory === "All" || item.category === bundleCategory;

    const matchesKeyword =
      !keyword || item.name?.toLowerCase().includes(keyword);

    return matchesCategory && matchesKeyword;
  });
  const handleBundleQuantityChange = (id, value) => {
    const quantity = Math.max(1, Number(value) || 1);

    setForm((current) => ({
      ...current,
      bundleItems: current.bundleItems.map((item) =>
        getBundleItemId(item) === id ? { ...item, quantity } : item,
      ),
    }));
  };

  const handleBundleQuantityKeyDown = (event) => {
    if (INVALID_NUMBER_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  };

  const removeBundleItem = (id) => {
    setForm((current) => ({
      ...current,
      bundleItems: current.bundleItems.filter(
        (item) => getBundleItemId(item) !== id,
      ),
    }));
  };

  const toggleBundleItem = (item) => {
    const itemId = getBundleItemId(item);

    setForm((current) => {
      const exists = current.bundleItems.some(
        (selectedItem) => getBundleItemId(selectedItem) === itemId,
      );

      return {
        ...current,
        bundleItems: exists
          ? current.bundleItems.filter(
              (selectedItem) => getBundleItemId(selectedItem) !== itemId,
            )
          : [{ ...item, id: itemId, quantity: 1 }, ...current.bundleItems],
      };
    });
  };

  if (isFullEdit && !form?.setupBundle) {
    return (
      <section className="rounded-[15px] border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Bundle Composition
            </p>
            <p className="text-xs text-muted-foreground">
              Choose the menu items included in this bundle.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, setupBundle: true }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                form?.setupBundle
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
                  setupBundle: false,
                  bundleItems: [],
                }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !form?.setupBundle
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
          <p className="text-sm font-semibold text-foreground">
            Bundle Composition
          </p>
          <p className="text-xs text-muted-foreground">
            Add items on the left and review quantities on the right.
          </p>
        </div>

        {isFullEdit ? (
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, setupBundle: true }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                form?.setupBundle
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
                  setupBundle: false,
                  bundleItems: [],
                }))
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !form?.setupBundle
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              Set up later
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_24px_1fr] xl:items-stretch">
        <div className="flex h-[472px] max-h-[472px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border bg-white">
          <div className="border-b border-border bg-white px-4 py-3">
            <p className="text-sm font-semibold">Available Menu Items</p>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={bundleSearch}
                  onChange={(event) => setBundleSearch(event.target.value)}
                  placeholder="Search menu items..."
                  className="pl-9"
                />
              </div>
              <Select value={bundleCategory} onValueChange={setBundleCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filter Category</SelectLabel>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white">
            {filteredBundleItems?.length > 0 ? (
              filteredBundleItems.map((item) => {
                const itemId = getBundleItemId(item);
                const isSelected = form?.bundleItems?.some(
                  (selectedItem) => getBundleItemId(selectedItem) === itemId,
                );
                const category = categories.find(
                  (category) => category._id === item.category,
                );

                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => toggleBundleItem(item)}
                    className={`grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 ${
                      isSelected
                        ? "border-l-4 border-l-primary bg-[color:color-mix(in_srgb,var(--color-primary)_8%,white)]"
                        : "hover:bg-muted/15"
                    }`}
                  >
                    <img
                      src={Cloudinary.getMenuImg(item.imgId, itemId)}
                      alt={item.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">P{item.price}</p>
                      <p
                        className={`text-xs font-medium ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {isSelected ? "Added" : "Add"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="bg-white px-4 py-10 text-center text-sm text-muted-foreground">
                No menu items matched your search.
              </div>
            )}
          </div>
        </div>

        <div className="hidden items-center justify-center xl:flex">
          <div className="flex h-full items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="flex h-[472px] max-h-[472px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border bg-white">
          <div className="border-b border-border bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Selected for Bundle
                </p>
                <p className="text-sm text-muted-foreground">
                  Build the bundle item list and set quantity for each one.
                </p>
              </div>
              <div className="flex min-w-[72px] flex-col items-center justify-center rounded-lg border border-border px-3 py-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Items
                </p>
                <p className="text-base font-semibold text-foreground">
                  {form.bundleItems?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white p-3">
            {form.bundleItems?.length > 0 ? (
              <div className="space-y-3">
                {form.bundleItems.map((item) => (
                  <div
                    key={getBundleItemId(item)}
                    className="rounded-xl border border-border px-4 py-3"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={Cloudinary.getMenuImg(
                              item.imgId,
                              getBundleItemId(item),
                            )}
                            alt={item.name}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-base font-semibold text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              P{item.price} each
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-center">
                          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            COST / SERVE
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {Formatter.amount(
                              Number(item.price || 0) *
                                Number(item.quantity || 0),
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-[120px_auto] items-start gap-3 border-t border-border/70 pt-3">
                        <div className="flex flex-col justify-start gap-1 self-start bg-card">
                          <Label className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            Bundle Qty
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onKeyDown={handleBundleQuantityKeyDown}
                            onChange={(event) =>
                              handleBundleQuantityChange(
                                getBundleItemId(item),
                                event.target.value,
                              )
                            }
                            className="h-9 border-border bg-transparent px-2 text-center text-sm"
                          />
                        </div>

                        <div className="flex self-end justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              removeBundleItem(getBundleItemId(item))
                            }
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
                Selected bundle items will appear here.
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm">
              <span className="font-medium text-muted-foreground">
                Total estimated bundle cost
              </span>
              <span className="text-lg font-semibold text-primary">
                {Formatter.amount(totalEstimatedBundleCost)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bundles;
