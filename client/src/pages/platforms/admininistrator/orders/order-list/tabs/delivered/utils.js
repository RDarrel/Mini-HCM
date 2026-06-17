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

export const statusMeta = {
  received: {
    label: "Received",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
  },
  resolved: {
    label: "Resolved",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
  },
  refunded: {
    label: "Refunded",
    className: "border-accent/40 bg-accent/20 text-accent-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-destructive/40 bg-destructive/10 text-foreground",
  },
};

export const getPurchaseMeta = (purchase) => {
  const statusKey = String(purchase?.status || "received").toLowerCase();
  const meta = statusMeta[statusKey] || statusMeta.received;

  const supplierName =
    purchase?.supplier?.name ||
    purchase?.supplier?.company ||
    purchase?.supplier?.label ||
    "Supplier";

  const receivedAt =
    purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;

  return { meta, supplierName, receivedAt };
};

export const getTotals = (items) => {
  return items.reduce(
    (acc, item) => {
      const unitCost = Number(item?.cost ?? item?.inventory?.cost ?? 0);
      const orderedQty = Number(
        item?.quantity?.incoming ??
          item?.quantity?.order ??
          item?.quantity?.request ??
          0,
      );
      const receivedQty = Number(item?.quantity?.received ?? 0);

      const orderedAmount =
        Number.isFinite(unitCost) && Number.isFinite(orderedQty)
          ? unitCost * orderedQty
          : 0;
      const receivedAmount =
        Number.isFinite(unitCost) && Number.isFinite(receivedQty)
          ? unitCost * receivedQty
          : 0;

      acc.ordered += orderedAmount;
      acc.received += receivedAmount;
      return acc;
    },
    { ordered: 0, received: 0 },
  );
};

