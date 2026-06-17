import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PackageCheck,
  PackageMinus,
  PackagePlus,
  PackageX,
  Search,
} from "lucide-react";
import { categoryOptions, stockOptions, typeOptions } from "./config";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import {
  BROWSE,
  FILTER,
  SEARCH,
  SetCREATE,
  RESET,
} from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_SUPPLIERS } from "@/services/redux/slices/procurement/suppliers";

const FilterSelect = ({
  value,
  onValueChange,
  placeholder,
  options = [],
  allLabel,
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="w-full ">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">{allLabel}</SelectItem>
      {options?.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const SummaryCard = ({
  title,
  count = 0,
  description,
  Icon,
  tone = "neutral",
}) => {
  const toneClass =
    tone === "success"
      ? "border-emerald-200/60 from-emerald-50/60 to-emerald-50/20 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200/60 from-amber-50/60 to-amber-50/20 text-amber-700"
        : "border-red-200/60 from-red-50/60 to-red-50/20 text-red-700";

  const pillClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <div
      className={`rounded-[8px] border bg-gradient-to-br via-white p-2.5 shadow-sm ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-[10px] font-semibold uppercase leading-none tracking-[0.16em]">
              {title}
            </p>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[15px] font-semibold leading-none ${pillClass}`}
            >
              {count}
            </span>
          </div>
          <p className="mt-1 truncate text-[11px] leading-none text-muted-foreground">
            {description}
          </p>
        </div>
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl ${pillClass}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};

const InventoryHeader = () => {
  const { token, auth } = useSelector(({ auth }) => auth);
  const { params, collections, search } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token }));
    dispatch(BROWSE_SUPPLIERS({ token }));
    return () => dispatch(RESET());
  }, [dispatch, token]);

  const stockSummary = useMemo(() => {
    const summary = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };

    (collections || []).forEach((item) => {
      const status = item?.stockStatus;
      if (status === "Out of Stock") summary.outOfStock += 1;
      else if (status === "Low Stock") summary.lowStock += 1;
      else summary.inStock += 1;
    });

    return summary;
  }, [collections]);

  const stockFilterMeta = useMemo(() => {
    const paramsWithoutStatus = Object.fromEntries(
      Object.entries(params || {}).filter(([key]) => key !== "status"),
    );

    const baseRows = (collections || []).filter((item) =>
      Object.entries(paramsWithoutStatus).every(
        ([key, value]) => !value || value === "all" || item?.[key] === value,
      ),
    );

    const counts = {
      "In Stock": 0,
      "Low Stock": 0,
      "Out of Stock": 0,
    };

    baseRows.forEach((item) => {
      const status = item?.stockStatus;
      counts[status] = (counts[status] || 0) + 1;
    });

    return {
      counts,
      options: stockOptions.map((option) => ({
        ...option,
        label: `${option.label} (${counts[option.value] || 0})`,
      })),
    };
  }, [collections, params]);

  return (
    <>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-foreground">
              Inventory List
            </CardTitle>
            <CardDescription>
              Search items and narrow results by type, category, measurement,
              and stock condition.
            </CardDescription>
          </div>
          {auth?.role === 1 && (
            <Button
              onClick={() => dispatch(SetCREATE())}
              className="lg:self-start"
            >
              <PackagePlus className="h-4 w-4" />
              New Inventory
            </Button>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <SummaryCard
            title="In Stock"
            count={stockSummary.inStock}
            description="Items ready to use"
            Icon={PackageCheck}
            tone="success"
          />
          <SummaryCard
            title="Low Stock"
            count={stockSummary.lowStock}
            description="Reorder soon"
            Icon={PackageMinus}
            tone="warning"
          />
          <SummaryCard
            title="Out of Stock"
            count={stockSummary.outOfStock}
            description="Needs restock"
            Icon={PackageX}
            tone="danger"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => dispatch(SEARCH(event.target.value))}
              placeholder="Search inventory item..."
              className="pl-9"
              type="search"
            />
          </div>

          <FilterSelect
            value={params.type || "all"}
            onValueChange={(value) =>
              dispatch(FILTER({ ...params, type: value, category: "all" }))
            }
            placeholder="Type"
            options={typeOptions}
            allLabel="All types"
          />
          <FilterSelect
            value={params.category || "all"}
            onValueChange={(value) =>
              dispatch(FILTER({ ...params, category: value }))
            }
            placeholder="Category"
            options={params.type !== "all" ? categoryOptions[params.type] : []}
            allLabel="All categories"
          />

          <FilterSelect
            value={params.status || "all"}
            onValueChange={(value) =>
              dispatch(FILTER({ ...params, status: value }))
            }
            placeholder="Stock status"
            options={stockFilterMeta.options}
            allLabel="All stock levels"
          />
        </div>
      </CardHeader>
    </>
  );
};

export default InventoryHeader;
