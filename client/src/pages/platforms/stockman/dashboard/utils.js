import { Formatter } from "@/services/utilities";

export const EXPIRING_SOON_DAYS = 7;

export const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const getItemsFromPurchase = (purchase) => {
  if (!purchase) return [];
  const items = Array.isArray(purchase?.items)
    ? purchase.items
    : Array.isArray(purchase?.orders)
      ? purchase.orders
      : [];
  return Array.isArray(items) ? items : [];
};

export const formatDeliveryWindow = (deliveryWindow) => {
  const from = deliveryWindow?.from ? Formatter.date(deliveryWindow.from) : "";
  const to = deliveryWindow?.to ? Formatter.date(deliveryWindow.to) : "";
  if (from && to) return `${from} - ${to}`;
  return from || "Incoming";
};
