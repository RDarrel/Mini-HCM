import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarClock, PackageCheck, TriangleAlert } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Stock } from "@/services/utilities";
import { TOGGLE_BATCHES_MODAL } from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_STOCK_BATCH } from "@/services/redux/slices/inventory/stockBatch";

import BatchesModalHeader from "./header";
import BatchesModalBody from "./body";

const DAY_MS = 24 * 60 * 60 * 1000;

const getExpiryStatus = (expiryDate, soonDays = 7) => {
  if (!expiryDate) return "unknown";
  const today = new Date();
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return "unknown";

  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / DAY_MS);
  if (diffDays < 0) return "expired";
  if (diffDays <= soonDays) return "expiring soon";
  return "good";
};

const statusBadge = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "active") return { label: "Active", className: "bg-emerald-600" };
  if (key === "consumed")
    return { label: "Consumed", className: "bg-muted text-foreground" };
  if (key === "not tracked")
    return { label: "Not Tracked", className: "bg-muted text-foreground" };
  if (key === "expired") return { label: "Expired", className: "bg-red-600" };
  if (key === "expiring soon")
    return { label: "Expiring Soon", className: "bg-amber-500" };
  if (key === "good") return { label: "Good", className: "bg-emerald-600" };
  return { label: "Unknown", className: "bg-muted text-foreground" };
};

const toBatchCode = (index) => {
  const number = String(index + 1).padStart(4, "0");
  return `Batch-${number}`;
};

const InventoryBatchesModal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { showBatchesModal, selected } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { collections: batches, isLoading } = useSelector(
    ({ stockBatch }) => stockBatch,
  );

  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const selectedId = selected?._id;
  const tracksExpiration = Boolean(selected?.trackExpiration);
  const tableColSpan = tracksExpiration ? 7 : 6;
  const unit = Stock.getUnit(selected?.measurement);

  const formatQty = (value) => {
    if (value === null || value === undefined || value === "") return "—";

    if (typeof value === "number")
      return Stock.display(value, selected?.measurement);

    const raw = String(value);
    if (!unit) return raw;
    const hasUnit = new RegExp(`\\b${unit}\\b`, "i").test(raw);
    return hasUnit ? raw : `${raw} ${unit}`;
  };

  const toggle = () => dispatch(TOGGLE_BATCHES_MODAL());

  useEffect(() => {
    if (showBatchesModal && selectedId && token) {
      dispatch(
        BROWSE_STOCK_BATCH({
          token,
          params: { inventory: selectedId, includeConsumed: 1 },
        }),
      );
      setSearch("");
    }
  }, [dispatch, showBatchesModal, selectedId, token]);

  const rows = useMemo(() => {
    const keyword = String(search || "")
      .trim()
      .toLowerCase();
    const list = Array.isArray(batches) ? [...batches] : [];

    const sorted = list.sort((a, b) => {
      if (tracksExpiration) {
        if (a.remainingQuantity === 0 && b.remainingQuantity > 0) return 1;

        if (a.remainingQuantity > 0 && b.remainingQuantity === 0) return -1;
        return new Date(a.expirationDate) - new Date(b.expirationDate);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    const enriched = sorted.map((batch) => {
      const supplierName =
        batch?.purchase?.supplier?.name || batch?.supplier?.name || "Supplier";
      const receivedDate = batch?.createdAt;
      const expirationDate = tracksExpiration ? batch?.expirationDate : null;

      const expiryStatus = tracksExpiration
        ? getExpiryStatus(expirationDate)
        : "active";

      return {
        ...batch,
        supplierName,
        receivedDate,
        expirationDate,
        status:
          expiryStatus !== "expired" && batch?.remainingQuantity === 0
            ? "consumed"
            : expiryStatus,
        expiryStatus,
        isExpired: tracksExpiration && expiryStatus === "expired",
        displayCode: `B-${batch._id.toString().slice(-6).toUpperCase()}`,
      };
    });

    if (!keyword) return enriched;
    return enriched.filter((batch) => {
      const code = String(batch.displayCode || "").toLowerCase();
      const supplier = String(batch.supplierName || "").toLowerCase();
      return code.includes(keyword) || supplier.includes(keyword);
    });
  }, [batches, search, tracksExpiration]);

  return (
    <Dialog open={showBatchesModal} onOpenChange={toggle}>
      <DialogContent className="border-border bg-card p-5 sm:max-w-5xl">
        <BatchesModalHeader
          selected={selected}
          tracksExpiration={tracksExpiration}
          rowsCount={rows.length}
          search={search}
          setSearch={setSearch}
          icons={{
            available: PackageCheck,
            soon: CalendarClock,
            expired: TriangleAlert,
          }}
        />

        <BatchesModalBody
          rows={rows}
          isLoading={isLoading}
          tableColSpan={tableColSpan}
          tracksExpiration={tracksExpiration}
          formatQty={formatQty}
          statusBadge={statusBadge}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InventoryBatchesModal;
