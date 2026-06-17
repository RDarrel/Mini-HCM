export const getItemsFromPurchase = (purchase) => {
  if (!purchase) return [];

  const items = Array.isArray(purchase?.items)
    ? purchase.items
    : Array.isArray(purchase?.orders)
      ? purchase.orders
      : [];

  return Array.isArray(items) ? items : [];
};

export const getItemKey = (item) =>
  String(item?._id || item?.inventory?._id || item?.inventory || item?.name);

export const getOrderedQty = (item) => {
  const redeliveryQty = item?.quantity?.order;
  if (redeliveryQty !== undefined && redeliveryQty !== null)
    return Number(redeliveryQty) || 0;

  const requested = item?.quantity?.request;
  if (requested !== undefined && requested !== null) return Number(requested) || 0;

  const incoming = item?.quantity?.incoming;
  if (incoming !== undefined && incoming !== null) return Number(incoming) || 0;

  return Number(item?.quantity) || 0;
};

export const formatQty = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

export const round2 = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
};

export const normalizeQtyInput = (value) => {
  const number = round2(Number(value));
  if (!Number.isFinite(number)) return "";
  if (Number.isInteger(number)) return String(number);

  return String(number.toFixed(2)).replace(/0+$/, "").replace(/\.$/, "");
};

export const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getUnitCost = (item) => {
  const raw = item?.cost ?? item?.inventory?.cost ?? item?.inventory?.price;
  const number = Number(raw);
  return Number.isFinite(number) ? number : null;
};

export const getTodayISO = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
