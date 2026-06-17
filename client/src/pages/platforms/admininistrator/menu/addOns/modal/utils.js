import { Stock } from "@/services/utilities";

export const GROUP_OPTIONS = [
  { label: "Extras", value: "extras" },
  { label: "Toppings", value: "toppings" },
  { label: "Sides", value: "sides" },
  { label: "Drinks", value: "drinks" },
];

export const INVENTORY_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Ingredients", value: "ingredient" },
  { label: "Resell", value: "resell" },
];

export const INVENTORY_CATEGORY_OPTIONS = {
  all: [{ label: "All Categories", value: "all" }],
  ingredient: [
    { label: "All Categories", value: "all" },
    { label: "Meat", value: "meat" },
    { label: "Vegetable", value: "vegetable" },
    { label: "Seafood", value: "seafood" },
    { label: "Grain", value: "grain" },
    { label: "Dairy", value: "dairy" },
    { label: "Condiment", value: "condiment" },
    { label: "Other", value: "other" },
  ],
  resell: [
    { label: "All Categories", value: "all" },
    { label: "Beverage", value: "beverage" },
    { label: "Snack", value: "snack" },
    { label: "Other", value: "other" },
  ],
};

export const INITIAL_FILTERS = {
  type: "all",
  category: "all",
  search: "",
};

export const UNIT_OPTIONS = {
  weight: [
    { label: "g", value: "g" },
    { label: "kg", value: "kg" },
  ],
  volume: [
    { label: "ml", value: "ml" },
    { label: "L", value: "l" },
  ],
  pieces: [{ label: "pcs", value: "pcs" }],
};

export const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const getExistingAddOn = (collections = [], name = "", selectedId) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) return null;

  return collections.find(
    (item) =>
      normalizeName(item?.name) === normalizedName && item?._id !== selectedId,
  );
};

export const normalizeUnit = (unit = "") => unit.toLowerCase();

export const getUnitOptions = (measurement) => UNIT_OPTIONS[measurement] || [];

export const resolveUnitValue = (unitOptions = [], unit = "", measurement) =>
  unitOptions.find((option) => option.value === normalizeUnit(unit))?.value ||
  unitOptions[0]?.value ||
  Stock.getUnit(measurement) ||
  null;

export const mapSelectedIngredient = (entry, inventoryItems) => {
  const linkedInventoryId = entry?.inventory?._id || entry?.inventory || "";
  const linkedInventory =
    inventoryItems.find((item) => item?._id === linkedInventoryId) || null;
  const measurement = linkedInventory?.measurement;
  const unitOptions = getUnitOptions(measurement);
  const fallbackUnit = resolveUnitValue(unitOptions, entry?.unit, measurement);

  return {
    inventory: linkedInventory?._id || "",
    qtyPerOrder: entry?.qtyPerOrder ?? 1,
    unit: fallbackUnit,
  };
};

export const getInventoryCost = (qtyPerOrder, unit, linkedItem) => {
  const quantity = Number(qtyPerOrder) || 0;
  const cost = Number(linkedItem?.cost) || 0;
  const measurement = linkedItem?.measurement;
  const normalized = normalizeUnit(unit);

  if (!quantity || !cost || !measurement) return 0;

  switch (measurement) {
    case "weight":
      return normalized === "g" ? (quantity / 1000) * cost : quantity * cost;
    case "volume":
      return normalized === "ml" ? (quantity / 1000) * cost : quantity * cost;
    case "pieces":
      return quantity * cost;
    default:
      return 0;
  }
};

export const isPieceUnit = (unit = "") => normalizeUnit(unit) === "pcs";

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  if (typeof error?.error === "string" && error.error.trim()) {
    return error.error;
  }

  if (typeof error?.payload === "string" && error.payload.trim()) {
    return error.payload;
  }

  return fallback;
};
