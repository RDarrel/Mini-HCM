import { AlertCircle } from "lucide-react";

const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const NameWarning = ({ name = "", selectedId, collections = [] }) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  const existingItem = collections.find(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );

  if (!existingItem) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        "{name.trim()}" already exists. Please use a different inventory item
        name.
      </p>
    </div>
  );
};

const isExistingInventoryName = (collections = [], name = "", selectedId) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return false;
  }

  return collections.some(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );
};

export { normalizeName, NameWarning, isExistingInventoryName };

