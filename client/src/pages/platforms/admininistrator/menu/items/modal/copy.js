export const initialForm = {
  name: "",
  category: "",
  price: "",
  type: "prepared",
  description: "",
  image: null,
  bundleItems: [],
  ingredients: [],
  setupRecipe: false,
  setupBundle: false,
  setupResellLink: false,
  enableAddOns: false,
  recommendedAddOns: [],
};

export const getSetupRequirementLabel = (type) => {
  if (type === "bundle") return "set up the bundle composition";
  if (type === "resell") return "link a stock item";
  return "create a recipe";
};

export const getSetupOnlyDialogMeta = (type) => {
  if (type === "bundle") {
    return {
      title: "Manage Bundle Items",
      description: "Select the menu items included in this bundle.",
    };
  }

  if (type === "resell") {
    return {
      title: "Manage Inventory Link",
      description: "Link a stock item for selling and inventory tracking.",
    };
  }

  return {
    title: "Manage Recipe",
    description: "Select the ingredients used to prepare one serving.",
  };
};

export const getRemoveSetupCopy = (type) => {
  if (type === "bundle") {
    return {
      title: "Confirm bundle removal",
      lead: "You removed all items from this bundle.",
      detail:
        "If you continue, this menu item will be saved as unavailable and it will no longer be sold until you set up the bundle composition again.",
    };
  }

  if (type === "resell") {
    return {
      title: "Confirm stock link removal",
      lead: "You removed the linked stock item for this menu.",
      detail:
        "If you continue, this menu item will be saved as unavailable and it will no longer be sold until you link a stock item again.",
    };
  }

  return {
    title: "Confirm recipe removal",
    lead: "You removed all ingredients from this recipe.",
    detail:
      "If you continue, this menu item will be saved as unavailable and it will no longer be sold until you create a recipe again.",
  };
};

