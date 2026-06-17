import { Clock, XCircle } from "lucide-react";

const statusMeta = {
  pending: {
    label: "Pending",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    className: "border-destructive/40 bg-destructive/10 text-foreground",
    icon: XCircle,
  },
};

export const getStockRequestStatusMeta = (statusKey) => {
  const key = String(statusKey || "pending").toLowerCase();
  return statusMeta[key] || statusMeta.pending;
};

