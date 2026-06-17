import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { capitalize } from "lodash";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Inventory, Stock } from "@/services/utilities";
import {
  TOGGLE_WASTE_MODAL,
  REPORT_WASTE as REPORT_WASTE_INVENTORY,
} from "@/services/redux/slices/inventory/inventoryItems";
import { REPORT_WASTE } from "@/services/redux/slices/inventory/stockBatch";
import Spinner from "@/components/shared/spinner";

const WASTE_REASONS = [
  { value: "damaged", label: "Damaged" },
  { value: "spoiled", label: "Spoiled" },
  { value: "other", label: "Other" },
];

const getUnitOptions = (measurement) => {
  const key = String(measurement || "").toLowerCase();
  if (key === "weight") return ["kg", "g"];
  if (key === "volume") return ["l", "ml"];
  if (key === "pieces") return ["pcs"];
  return ["pcs"];
};

const getAvailableForUnit = (selected, unit) => {
  const measurement = String(selected?.measurement || "").toLowerCase();
  if (measurement === "weight") {
    if (unit === "g") return Number(selected?.stock?.current ?? 0);
    return Number(selected?.stockDisplay?.current ?? 0);
  }

  if (measurement === "volume") {
    if (unit === "ml") return Number(selected?.stock?.current ?? 0);
    return Number(selected?.stockDisplay?.current ?? 0);
  }

  return Number(
    selected?.stockDisplay?.current ?? selected?.stock?.current ?? 0,
  );
};

const formatAvailableLabel = (selected, unit) => {
  const measurement = String(selected?.measurement || "").toLowerCase();
  const rawAvailable = getAvailableForUnit(selected, unit);
  if (measurement === "weight") {
    if (unit === "g") return `${rawAvailable?.toLocaleString()} g`;
    return Stock.display(rawAvailable, selected?.measurement);
  }

  if (measurement === "volume") {
    if (unit === "ml") return `${rawAvailable?.toLocaleString()} ml`;
    return `${rawAvailable} L`;
  }

  return `${rawAvailable?.toLocaleString()} pc`;
};

const ReportWasteModal = () => {
  const { token, auth } = useSelector(({ auth }) => auth);
  const { showWasteModal, selected } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { formSubmitted } = useSelector(({ stockBatch }) => stockBatch);

  const dispatch = useDispatch();

  const unitOptions = useMemo(
    () => getUnitOptions(selected?.measurement),
    [selected?.measurement],
  );

  const [form, setForm] = useState({
    source: "damaged",
    qty: "",
    unit: unitOptions[0] || "kg",
    remarks: "",
  });

  const toggle = () => dispatch(TOGGLE_WASTE_MODAL());

  useEffect(() => {
    if (showWasteModal) {
      const initialUnit = getUnitOptions(selected?.measurement)[0] || "kg";
      setForm({
        source: "damaged",
        qty: "",
        unit: initialUnit,
        remarks: "",
      });
    }
  }, [showWasteModal, selected?.measurement]);

  const availableMax = useMemo(
    () => getAvailableForUnit(selected, form.unit),
    [selected, form.unit],
  );

  const availableLabel = useMemo(
    () => formatAvailableLabel(selected, form.unit),
    [selected, form.unit],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      qty: Number(form.qty),
      user: auth._id,
      unit: form.unit,
      inventory: selected._id,
      source: form.source,
      remarks: form.remarks || "",
      measurement: selected.measurement,
      trackExpiration: Boolean(selected?.trackExpiration),
    };

    dispatch(REPORT_WASTE({ data: payload, token }))
      .unwrap()
      .then((action) => {
        dispatch(REPORT_WASTE_INVENTORY(action?.payload));
        toggle();
        toast.success(action?.success);
      })
      .catch((error) => {
        toast.error(error?.message);
      });
  };

  const measurementKey = String(selected?.measurement || "").toLowerCase();
  const qtyIsInteger =
    measurementKey === "pieces" || form.unit === "g" || form.unit === "ml";

  return (
    <Dialog open={showWasteModal} onOpenChange={toggle}>
      <DialogContent className="border-border bg-card p-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Waste — {capitalize(selected?.name || "Inventory Item")}
          </DialogTitle>
          <DialogDescription>
            Select a waste reason and enter the quantity to report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-[8px] border border-border bg-muted/30 p-3">
            <p className="text-sm font-medium text-foreground">
              Available Stock:{" "}
              <span className="font-semibold text-foreground">
                {availableLabel}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Validation is based on the selected unit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-12">
            <div className="space-y-1.5 sm:col-span-5">
              <Label>Waste reason</Label>
              <Select
                value={form.source}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, source: value }))
                }
              >
                <SelectTrigger className="w-full min-w-[200px]">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {WASTE_REASONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-5">
              <Label>Quantity</Label>
              <Input
                type="number"
                inputMode={qtyIsInteger ? "numeric" : "decimal"}
                pattern={qtyIsInteger ? "[0-9]*" : undefined}
                autoComplete="off"
                className="w-full"
                min="1"
                max={availableMax}
                value={String(form.qty)}
                onChange={(event) => {
                  const value = event.target.value;
                  const cleanValue = Inventory.sanitizeQtyInp(
                    selected?.measurement,
                    value,
                  );

                  setForm((prev) => ({ ...prev, qty: cleanValue }));
                }}
                placeholder={`Enter quantity (max ${availableLabel})`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Unit</Label>
              <Select
                value={form.unit}
                onValueChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    unit: value,
                    qty: "",
                  }));
                }}
              >
                <SelectTrigger className="w-full min-w-[72px]">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Remarks (optional)</Label>
            <Textarea
              value={form.remarks}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, remarks: event.target.value }))
              }
              rows={3}
              placeholder="Add additional notes (optional)"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={toggle}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitted}>
              Report Waste <Spinner formSubmitted={formSubmitted} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportWasteModal;
