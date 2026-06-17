import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Truck, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

const unitLabelMap = {
  weight: "kg",
  volume: "liter",
  pieces: "pcs",
};

const Suppliers = ({ form, setForm = () => {} }) => {
  const { collections: suppliers } = useSelector(({ suppliers }) => suppliers);

  const [supplierId, setSupplierId] = useState("");
  const [unitCost, setUnitCost] = useState("");

  const unitLabel = unitLabelMap[form?.measurement] || "unit";

  const canTag = Boolean(supplierId) && Number(unitCost) > 0;

  const tagSupplier = () => {
    const isPrimary = form?.suppliers?.length === 0;
    const _supplier = suppliers.find(
      (supplier) => supplier?._id === supplierId,
    );
    if (!_supplier) return;

    const _suppliers = [...form?.suppliers];
    _suppliers.push({
      supplier: _supplier,
      cost: unitCost,
      isPrimary,
    });
    setForm({
      ...form,
      suppliers: _suppliers,
    });
    setSupplierId("");
    setUnitCost("");
  };

  const removeTagged = (id) => {
    updateSupplier(id, true);
  };
  const updateSupplier = (id, isRemove = false, key, value) => {
    const _suppliers = [...form?.suppliers];
    const _index = _suppliers.findIndex(
      (tagged) => tagged?.supplier?._id === id,
    );
    if (_index === -1) return;

    if (isRemove) {
      _suppliers.splice(_index, 1);
    } else {
      _suppliers[_index] = {
        ..._suppliers[_index],
        [key]: value,
      };
    }
    setForm({
      ...form,
      suppliers: _suppliers,
    });
  };
  const setDefault = (id) => {
    setForm((prev) => ({
      ...prev,
      suppliers: (prev?.suppliers || []).map(({ supplier, ...rest }) => ({
        ...rest,
        supplier,
        isPrimary: String(id) === String(supplier?._id),
      })),
    }));
  };

  const updateCost = (id, value) => {
    updateSupplier(id, false, "cost", Number(value));
  };

  const { suppliers: tagged = [] } = form || {};
  return (
    <div className="md:col-span-12">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Suppliers</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add suppliers for this item, set their cost per {unitLabel}, and
              select a primary supplier (used as default for orders).
            </p>
          </div>

          <Badge variant="secondary" className="shrink-0 rounded-full">
            {tagged.length}
          </Badge>
        </div>

        <div className="grid gap-2 p-3 md:grid-cols-[1.35fr_1fr_auto] md:items-start">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              Supplier
            </p>

            <Select value={supplierId ?? ""} onValueChange={setSupplierId}>
              <SelectTrigger size="sm" className="h-8 w-full">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>

              <SelectContent>
                {suppliers
                  ?.filter(
                    (supplier) =>
                      !tagged.some((tag) => tag.supplier._id === supplier._id),
                  )
                  .map((supplier) => {
                    const id = supplier?._id;
                    const inactive =
                      String(supplier?.status || "") === "inactive";

                    return (
                      <SelectItem key={id} value={id} disabled={inactive}>
                        {supplier?.name || "Unnamed supplier"}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              Unit cost (per {unitLabel})
            </p>

            <Input
              className="h-8"
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
              placeholder={`Cost / ${unitLabel}`}
            />
          </div>

          <div className="space-y-1">
            <p className="invisible text-[11px] font-medium">Action</p>

            <Button
              type="button"
              size="sm"
              className="h-8"
              disabled={!canTag}
              onClick={tagSupplier}
            >
              <Plus className="h-4 w-4" />
              Tag
            </Button>
          </div>
        </div>

        <div className="border-t">
          {tagged.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/35">
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="w-40">Unit cost</TableHead>
                  <TableHead className="w-36 text-center">
                    Primary Supplier
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {tagged.map((row, index) => {
                  const supplierName =
                    row?.supplier?.name || "Unknown supplier";

                  const isDefault = Boolean(row?.isPrimary);

                  const inactive =
                    String(row?.supplier?.status || "") === "inactive";

                  return (
                    <TableRow
                      key={`${row?.supplier?._id}_${index}`}
                      className={`${isDefault ? "bg-primary/5" : ""} ${
                        inactive ? "opacity-60" : ""
                      }`}
                    >
                      <TableCell className="whitespace-normal">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-foreground">
                              {supplierName}
                            </p>

                            {isDefault && (
                              <Badge
                                variant="secondary"
                                className="rounded-full text-[10px]"
                              >
                                Primary
                              </Badge>
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {row?.supplier?.contact?.mobile || ""}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Input
                          className="h-8"
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.cost}
                          onChange={(event) =>
                            updateCost(row?.supplier?._id, event.target.value)
                          }
                          placeholder={`Cost / ${unitLabel}`}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isDefault}
                            disabled={inactive}
                            onCheckedChange={() => {
                              setDefault(row.supplier?._id);
                            }}
                            aria-label={`Set ${supplierName} as primary supplier`}
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTagged(row.supplier?._id)}
                          aria-label={`Remove ${supplierName}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
	          ) : (
	            <div className="p-2">
	              <Empty className="min-h-[96px] gap-3 bg-transparent p-3 md:p-4">
	                <EmptyHeader>
	                  <EmptyMedia variant="icon">
	                    <Truck className="size-5" />
	                  </EmptyMedia>

	                  <EmptyTitle className="text-base">No suppliers added</EmptyTitle>

	                  <EmptyDescription className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
	                    Select a supplier, enter unit cost, then click Tag.
	                  </EmptyDescription>
	                </EmptyHeader>
	              </Empty>
	            </div>
	          )}
	        </div>
      </div>
    </div>
  );
};

export default Suppliers;
