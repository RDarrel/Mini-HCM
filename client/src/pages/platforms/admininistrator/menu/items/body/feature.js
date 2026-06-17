import { BadgeCheck, ChefHat, FileWarning, Package2 } from "lucide-react";

const Feature = {
  getStockMeta: (stock = 0) => {
    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-50 text-red-600 border-red-200",
        icon: Package2,
      };
    }

    if (stock <= 5) {
      return {
        label: `Low Stock (${stock})`,
        className: "bg-amber-50 text-amber-600 border-amber-200",
        icon: Package2,
      };
    }

    return {
      label: `In Stock (${stock})`,
      className: "bg-green-50 text-green-600 border-green-200",
      icon: Package2,
    };
  },
  getPublishMeta: (item) => {
    if (item.category === "Resell") {
      return {
        label: item.isPublish ? "Published" : "Hidden",
        className: item.isPublish
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-slate-100 text-slate-600 border-slate-200",
        icon: BadgeCheck,
        helper: item.isPublish
          ? "Ready for selling"
          : "Not visible for selling yet",
      };
    }

    if (!item.hasRecipe) {
      return {
        label: "Needs Recipe",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: FileWarning,
        helper: "Chef needs to add a recipe first",
      };
    }

    if (!item.isPublish) {
      return {
        label: "Pending Chef Approval",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ChefHat,
        helper: item.chefApprovedBy
          ? `Draft only • Last handled by ${item.chefApprovedBy}`
          : "Recipe exists but not published yet",
      };
    }

    return {
      label: "Published",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: BadgeCheck,
      helper: item.chefApprovedBy
        ? `Approved by ${item.chefApprovedBy}`
        : "Ready for selling",
    };
  },
};

export default Feature;
