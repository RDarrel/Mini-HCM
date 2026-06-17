import { fullName } from "@/services/utilities";

export const getItemsFromPurchase = (purchase) => {
  if (!purchase) return [];
  const items = Array.isArray(purchase?.items)
    ? purchase.items
    : Array.isArray(purchase?.orders)
      ? purchase.orders
      : [];
  return Array.isArray(items) ? items : [];
};

export const formatReceivedBy = (receivedBy) => {
  if (!receivedBy) return "—";
  if (typeof receivedBy === "string") return receivedBy.slice(-8);

  if (receivedBy?.fullName && typeof receivedBy.fullName === "object") {
    return fullName(receivedBy.fullName);
  }

  if (typeof receivedBy === "object" && receivedBy?.fname) {
    return fullName(receivedBy);
  }

  return (
    receivedBy?.name ||
    receivedBy?.username ||
    receivedBy?.email ||
    String(receivedBy?._id || "").slice(-8) ||
    "—"
  );
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatISODate = (date) => {
  if (!date) return null;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(date))
    .replace(/\//g, "-");
};

export const getDefaultDeliveryWindow = () => {
  const now = new Date();

  const from = new Date(now);
  from.setDate(from.getDate() + 1);

  const to = new Date(now);
  to.setDate(to.getDate() + 3);

  return {
    from: formatISODate(from),
    to: formatISODate(to),
  };
};

export const computeShortGrandTotalAmount = (items) => {
  return (Array.isArray(items) ? items : []).reduce((sum, item) => {
    const unitCostRaw = item?.cost ?? item?.inventory?.cost ?? 0;
    const unitCost = Number(unitCostRaw);
    const shortQty = Number(item?.quantity?.order ?? 0);
    if (!Number.isFinite(unitCost) || !Number.isFinite(shortQty)) return sum;
    return sum + unitCost * Math.max(0, shortQty);
  }, 0);
};

