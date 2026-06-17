const unitAbbr = {
  weight: "kg",
  volume: "L",
  pieces: "pcs",
};

const unitFull = {
  weight: "Kilograms",
  volume: "Liters",
  pieces: "Pieces",
};
const Inventory = {
  getUnitByMeasurement: (measurement, isAbbr = true) => {
    const baseUnitMap = isAbbr ? unitAbbr : unitFull;
    return baseUnitMap[measurement] || "";
  },
  sanitizeQtyInp: (_measurement, _value) => {
    let value = _value;
    const measurement = String(_measurement || "").toLowerCase();
    if (measurement === "pieces") {
      // numbers only (no decimal)
      value = value.replace(/[^\d]/g, "");
    } else {
      // allow decimal (1 dot only)
      value = value.replace(/[^0-9.]/g, "");

      // prevent multiple dots
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }
    }

    return value;
  },
};

export default Inventory;
