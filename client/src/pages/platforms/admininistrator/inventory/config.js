export const typeOptions = [
  { label: "Ingredient", value: "ingredient" },
  { label: "Resell", value: "resell" },
];

export const categoryOptions = {
  ingredient: [
    { label: "Meat", value: "meat" },
    { label: "Vegetable", value: "vegetable" },
    { label: "Seafood", value: "seafood" },
    { label: "Grain", value: "grain" },
    { label: "Dairy", value: "dairy" },
    { label: "Condiment", value: "condiment" },
    { label: "Other", value: "other" },
  ],
  resell: [
    { label: "Beverage", value: "beverage" },
    { label: "Snack", value: "snack" },
    { label: "Other", value: "other" },
  ],
};

export const measurementOptions = [
  { label: "Weight", value: "weight", unit: "g" },
  { label: "Volume", value: "volume", unit: "ml" },
  { label: "Pieces", value: "pieces", unit: "pcs" },
];

export const stockOptions = [
  { label: "In Stock", value: "In Stock" },
  { label: "Low Stock", value: "Low Stock" },
  { label: "Out of Stock", value: "Out of Stock" },
];

export const unitMap = {
  weight: "g",
  volume: "ml",
  count: "pcs",
};

export const statusClasses = {
  "In Stock":
    "border-[color:color-mix(in_srgb,var(--color-chart-2)_35%,white)] bg-[color:color-mix(in_srgb,var(--color-chart-2)_14%,white)] text-[color:color-mix(in_srgb,var(--color-chart-4)_78%,black)]",
  "Low Stock": "border-accent/40 bg-accent/15 text-accent-foreground",
  "Out of Stock": "border-destructive/30 bg-destructive/10 text-destructive",
};

export const buildPayload = (form) => ({
  ...form,
  currentStock: Number(form.currentStock) || 0,
  baseUnit: unitMap[form.measurement],
});
