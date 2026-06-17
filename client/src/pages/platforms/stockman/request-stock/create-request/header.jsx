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
  categoryOptions,
  typeOptions,
} from "@/pages/platforms/admininistrator/inventory/config";
import { Search } from "lucide-react";

const stockLevelOptions = [
  { value: "out of stock", label: "Out of stock" },
  { value: "low stock", label: "Low stock" },
  { value: "in stock", label: "In stock" },
];

const FilterSelect = ({
  value,
  onValueChange,
  placeholder,
  options = [],
  allLabel,
  disabled = false,
}) => (
  <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger className="w-full">
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

const RequestStockHeader = ({
  search = "",
  setSearch,
  type = "all",
  setType,
  category = "all",
  setCategory,
  stockLevel = "all",
  setStockLevel,
}) => {
  const categoryList = type !== "all" ? categoryOptions[type] || [] : [];
  const categoryDisabled = type === "all";

  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
        <CardTitle className="text-2xl text-foreground">
          Request Items
        </CardTitle>
        <CardDescription>
          Select items and enter the quantities to request.
        </CardDescription>
        </div>

        <div className="relative w-full sm:max-w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search items..."
            className="pl-9"
            type="search"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <FilterSelect
          value={type}
          onValueChange={(value) => {
            setType(value);
            setCategory("all");
          }}
          placeholder="Type"
          options={typeOptions}
          allLabel="All types"
        />

        <FilterSelect
          value={category}
          onValueChange={setCategory}
          placeholder="Category"
          options={categoryList}
          allLabel="All categories"
          disabled={categoryDisabled}
        />

        <FilterSelect
          value={stockLevel}
          onValueChange={setStockLevel}
          placeholder="Stock level"
          options={stockLevelOptions}
          allLabel="All stock levels"
        />
      </div>
    </CardHeader>
  );
};

export default RequestStockHeader;
