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
import { useSelector } from "react-redux";

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

const CreateOrderHeader = ({
  search = "",
  setSearch,
  supplierId = "all",
  setSupplierId,
  type = "all",
  setType,
  category = "all",
  setCategory,
}) => {
  const { collections: suppliers } = useSelector(({ suppliers }) => suppliers);
  const categoryList = type !== "all" ? categoryOptions[type] || [] : [];
  const categoryDisabled = type === "all";

  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="text-2xl text-foreground">
            Create Order
          </CardTitle>
          <CardDescription>
            Select items to add to your order cart.
          </CardDescription>
        </div>

        <div className="relative w-full md:w-[320px]">
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_repeat(2,minmax(0,1fr))]">
        <FilterSelect
          value={supplierId}
          onValueChange={setSupplierId}
          placeholder="Supplier"
          options={(Array.isArray(suppliers) ? suppliers : [])
            .map((supplier) => ({
              value: String(supplier?._id || ""),
              label: String(supplier?.name || ""),
            }))
            .filter((option) => option.value)}
          allLabel="All suppliers"
        />

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
      </div>
    </CardHeader>
  );
};

export default CreateOrderHeader;
