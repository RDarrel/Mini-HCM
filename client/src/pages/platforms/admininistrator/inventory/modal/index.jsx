import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryOptions, measurementOptions, typeOptions } from "../config";
import { useDispatch, useSelector } from "react-redux";
import {
  SAVE,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/inventory/inventoryItems";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";
import { isExistingInventoryName, NameWarning } from "./utils";
import Suppliers from "./suppliers";

const INITIAL_FORM = {
  name: "",
  type: "ingredient",
  category: "other",
  minStock: "",
  measurement: "weight",
  trackExpiration: false,
  description: "",
  stock: {
    min: "",
  },
  suppliers: [],
};

const unitMap = {
  weight: "kg",
  volume: "liter",
  pieces: "pcs",
};

const sanitizeInteger = (value) => String(value ?? "").replace(/[^\d]/g, "");

const sanitizeDecimal = (value, maxDecimals = 2) => {
  const raw = String(value ?? "");
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  const whole = cleaned.slice(0, firstDot);
  const decimals = cleaned
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .slice(0, maxDecimals);
  return `${whole}.${decimals}`;
};

const FormField = ({ label, description = "", content, error = "" }) => (
  <div className="space-y-1.5">
    <div className="space-y-0">
      <Label className="leading-none">{label}</Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
    {content}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

const InventoryModal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { showModal, willCreate, formSubmitted, selected, collections } =
    useSelector(({ inventoryItems }) => inventoryItems);
  const [form, setForm] = useState(INITIAL_FORM);
  const dispatch = useDispatch();
  const isPieces = String(form?.measurement || "") === "pieces";

  const toggle = () => dispatch(TOGGLE());

  useEffect(() => {
    if (showModal) {
      if (!willCreate && selected) {
        setForm({
          ...INITIAL_FORM,
          ...selected,
          cost: selected?.cost ?? "",
          stock: {
            ...(selected?.stock || {}),
            // Keep as string while editing so users can type "1." then "1.5".
            min:
              selected?.stock?.min === 0
                ? "0"
                : String(selected?.stock?.min ?? ""),
          },
        });
      } else {
        console.log("running useEffect");
        setForm({ ...INITIAL_FORM });
      }
    }
  }, [willCreate, selected, showModal]);

  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const getCostLabel = () => {
    return `Reorder Level (${unitMap[form.measurement]})`;
  };

  const getCostPlaceholder = () => {
    return `Enter reorder level (${unitMap[form.measurement]})`;
  };

  const hasDuplicateName = isExistingInventoryName(
    collections,
    form.name,
    selected?._id,
  );

  const handleSave = () => {
    const stockMinRaw = form?.stock?.min ?? "";
    const stockMinNumber = stockMinRaw === "" ? undefined : Number(stockMinRaw);
    dispatch(
      SAVE({
        data: {
          ...form,
          cost: Number(form.cost),
          stock: {
            ...(form?.stock || {}),
            min: stockMinNumber,
          },
        },
        token,
      }),
    )
      .unwrap()
      .then(() => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success("Successfully saved inventory item.");
      })
      .catch((error) =>
        toast.error(
          error?.message || error || "Failed to save inventory item.",
        ),
      );
  };

  const handleUpdate = () => {
    const stockMinRaw = form?.stock?.min ?? "";
    const stockMinNumber = stockMinRaw === "" ? undefined : Number(stockMinRaw);
    dispatch(
      UPDATE({
        data: {
          ...form,
          cost: Number(form.cost),
          stock: {
            ...(form?.stock || {}),
            min: stockMinNumber,
          },
        },
        token,
      }),
    )
      .unwrap()
      .then(() => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success("Successfully updated inventory item.");
      })
      .catch((error) =>
        toast.error(
          error?.message || error || "Failed to update inventory item.",
        ),
      );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasDuplicateName) {
      toast.error("This inventory item name already exists.");
      return;
    }

    if (!form?.suppliers?.length) {
      toast.error("Please tag at least one supplier.");
      return;
    }

    if (willCreate) {
      handleSave();
    } else {
      handleUpdate();
    }
  };
  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent className="border-border bg-card sm:max-w-4xl ">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-2xl text-foreground">
            {willCreate ? "Create" : "Update"} Inventory Item
          </DialogTitle>
          <DialogDescription>
            Define the item and choose its measurement type (weight, volume, or
            pieces) for accurate tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Card className="gap-4 py-4">
            <CardContent className="px-4">
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <FormField
                    label="Item Name"
                    content={
                      <>
                        <Input
                          required
                          value={form.name}
                          onChange={(event) =>
                            handleChange("name", event.target.value)
                          }
                          placeholder="Enter inventory name"
                        />
                        <NameWarning
                          name={form.name}
                          selectedId={selected?._id}
                          collections={collections}
                        />
                      </>
                    }
                  />
                </div>

                <div className="md:col-span-3">
                  <FormField
                    label="Type"
                    content={
                      <Select
                        value={form.type}
                        onValueChange={(value) => {
                          const options = categoryOptions[value];
                          setForm((prev) => ({
                            ...prev,
                            type: value,
                            category: options[0].value,
                            ...(value === "resell" && {
                              measurement: "pieces",
                            }),
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                </div>

                <div className="md:col-span-3">
                  <FormField
                    label="Category"
                    content={
                      <Select
                        value={form?.category}
                        key={form.type}
                        onValueChange={(value) =>
                          handleChange("category", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions[form.type]?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                </div>

                <div className="md:col-span-4">
                  <FormField
                    label="Measurement"
                    content={
                      <Select
                        value={form.measurement}
                        onValueChange={(value) => {
                          setForm((prev) => ({
                            ...prev,
                            measurement: value,
                            stock: {
                              ...prev.stock,
                              min: "",
                            },
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select measurement" />
                        </SelectTrigger>
                        <SelectContent>
                          {(form.type === "resell"
                            ? [{ value: "pieces", label: "Pieces" }]
                            : measurementOptions
                          ).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    }
                  />
                </div>

                <div className="md:col-span-4">
                  <FormField
                    label="Track Expiration Date?"
                    content={
                      <div className="flex h-[37px] w-full items-center gap-1 rounded-md border border-input bg-background p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-7 flex-1 ${form.trackExpiration ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-muted"}`}
                          aria-pressed={form.trackExpiration}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              trackExpiration: true,
                            }))
                          }
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-7 flex-1 ${!form.trackExpiration ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-muted"}`}
                          aria-pressed={!form.trackExpiration}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              trackExpiration: false,
                            }))
                          }
                        >
                          No
                        </Button>
                      </div>
                    }
                  />
                </div>

                <div className="md:col-span-4">
                  <FormField
                    label={getCostLabel()}
                    content={
                      <Input
                        required
                        type="text"
                        inputMode={isPieces ? "numeric" : "decimal"}
                        pattern={isPieces ? "[0-9]*" : undefined}
                        autoComplete="off"
                        min="1"
                        value={String(form?.stock?.min ?? "")}
                        onBeforeInput={(event) => {
                          if (!isPieces) return;
                          const data = event.data ?? "";
                          // Blocks ".", "," and any non-digit before it ever shows up.
                          if (data && /\D/.test(data)) event.preventDefault();
                        }}
                        onKeyDown={(event) => {
                          if (!isPieces) return;
                          if (
                            event.key === "." ||
                            event.key === "," ||
                            event.key === "e" ||
                            event.key === "E"
                          ) {
                            event.preventDefault();
                          }
                        }}
                        onPaste={(event) => {
                          const text =
                            event.clipboardData?.getData("text") ?? "";
                          const next = isPieces
                            ? sanitizeInteger(text)
                            : sanitizeDecimal(text);
                          event.preventDefault();
                          setForm((prev) => ({
                            ...prev,
                            stock: {
                              ...prev.stock,
                              min: next,
                            },
                          }));
                        }}
                        onChange={(event) => {
                          const next = isPieces
                            ? sanitizeInteger(event.target.value)
                            : sanitizeDecimal(event.target.value);
                          setForm((prev) => ({
                            ...prev,
                            stock: {
                              ...prev.stock,
                              min: next,
                            },
                          }));
                        }}
                        placeholder={getCostPlaceholder()}
                      />
                    }
                  />
                </div>

                <div className="md:col-span-12">
                  <FormField
                    label="Description"
                    content={
                      <Textarea
                        value={form.description}
                        onChange={(event) =>
                          handleChange("description", event.target.value)
                        }
                        placeholder="Add item description or internal notes"
                        rows={4}
                      />
                    }
                  />
                </div>

                <div className="md:col-span-12">
                  <Suppliers form={form} setForm={setForm} />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={toggle}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitted || hasDuplicateName}>
              {willCreate ? "Save" : "Update"}
              <Spinner formSubmitted={formSubmitted} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
