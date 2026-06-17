import { capitalize } from "@/services/utilities";
import { Layers3, Soup, Store } from "lucide-react";

export const EMPTY_STATE_BY_TYPE = {
  bundle: "No bundled menu items added yet.",
  prepared: "No recipe ingredients added yet.",
  resell: "No linked resell inventory item yet.",
};

export const DETAIL_HINT_BY_TYPE = {
  bundle: "Review bundled items",
  prepared: "Review full recipe setup",
  resell: "Review linked stock item",
};

export const EMPTY_CTA_BY_TYPE = {
  bundle: {
    title: "This bundle is not set up yet.",
    action: "Manage bundle",
  },
  prepared: {
    title: "No recipe ingredients added yet.",
    action: "Manage recipe",
  },
  resell: {
    title: "No linked resell stock yet.",
    action: "Manage stock link",
  },
};

export const getMenuTypeMeta = (type) => {
  switch (type) {
    case "bundle":
      return {
        icon: Layers3,
        title: "Bundle Composition",
        summaryLabel: "bundled items",
      };
    case "resell":
      return {
        icon: Store,
        title: "Resell Link",
        summaryLabel: "linked item",
      };
    case "prepared":
    default:
      return {
        icon: Soup,
        title: "Recipe Ingredients",
        summaryLabel: "ingredients",
      };
  }
};

export const getDetailEntries = (item, categories = []) => {
  if (item?.type === "bundle") {
    return (item?.bundleItems || []).map((entry) => ({
      id: entry?._id || entry?.id,
      name: entry?.name || "Unknown menu item",
      quantity: Number(entry?.quantity || 1),
      price: Number(entry?.price || 0),
      category:
        categories.find((category) => category?._id === entry?.category)?.name ||
        entry?.category,
      type: entry?.type || null,
    }));
  }

  return (item?.ingredients || []).map((entry, index) => ({
    id: entry?.inventory?._id || entry?.inventory || `${item?._id}-${index}`,
    name: entry?.inventory?.name || "Unknown inventory item",
    quantity: Number(entry?.qtyPerOrder || 0),
    unit: entry?.unit || "",
    category: entry?.inventory?.category || null,
    type: entry?.inventory?.type || null,
    cost: Number(entry?.inventory?.cost || 0),
  }));
};

export const getRecommendedAddOnEntries = (addOns = []) => {
  if (!Array.isArray(addOns)) return [];

  return addOns
    .map((addOn, index) => ({
      id: addOn?._id || `${index}-${addOn?.name || "addon"}`,
      name: addOn?.name || "Untitled add-on",
      price: Number(addOn?.price || 0),
      group: addOn?.group || "extras",
    }))
    .filter((entry) => entry.id);
};

export const getCountLabel = (count, label) => {
  const base = count === 1 ? label.replace(/s$/, "") : label;
  return `${count} ${base}`;
};

export const getManageLabel = (type) => {
  if (type === "bundle") return "Manage Bundle Items";
  if (type === "resell") return "Manage Inventory Link";
  return "Manage Recipe";
};

export const getSetupCtaLabel = (type) => {
  if (type === "bundle") return "Set up bundle";
  if (type === "resell") return "Link stock item";
  return "Create recipe";
};

export const getSetupCtaDescription = (type) => {
  if (type === "bundle") return "Set up bundled items so it's ready to sell.";
  if (type === "resell") return "Link a stock item so it's ready to sell.";
  return "Create a recipe to sell & track this item.";
};

export const getSetupNowLabel = (type) => {
  if (type === "bundle") return "Set up bundle now";
  if (type === "resell") return "Link stock now";
  return "Create recipe now";
};

export const getAvailabilitySetupRequirement = (type) => {
  if (type === "bundle") return "add at least 2 bundle items";
  if (type === "resell") return "link a stock item";
  return "create a recipe";
};

export const getAvailabilityDoubleCheckTarget = (type) => {
  if (type === "bundle") return "bundle composition";
  if (type === "resell") return "stock link";
  return "recipe";
};

export const getAvailabilityManageLabel = (type) => {
  if (type === "bundle") return "Manage Bundle Items";
  if (type === "resell") return "Manage Inventory Link";
  return "Manage Recipe";
};

export const getMenuCategoryName = (menu, categories = []) => {
  const categoryId = menu?.category?._id || menu?.category || null;
  if (!categoryId) return "Uncategorized";

  return (
    categories.find((entry) => String(entry?._id) === String(categoryId))?.name ||
    "Uncategorized"
  );
};

export const getItemTypePillLabel = (type) =>
  type && type !== "prepared" ? capitalize(type) : null;

