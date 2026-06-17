import CustomPagination from "@/components/shared/pagination";
import { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import DeliveredDetailsModal from "./details-modal";
import DeliveredOrderCard from "./order-card";
import DeliveredSkeleton from "./skeleton";
import { handlePagination } from "@/services/utilities";

const ReceivedOrdersTab = () => {
  const { filtered: orders, isLoading } = useSelector(
    ({ purchases }) => purchases,
  );
  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);
  const [openById, setOpenById] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);

  if (isLoading) {
    return <DeliveredSkeleton />;
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No received orders yet
          </p>
          <p className="text-xs text-muted-foreground">
            Completed supplier orders will appear here once recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {handlePagination(rows, page, maxPage).map((purchase, index) => {
        const rowId = String(
          purchase?._id ||
            purchase?.supplier?.name ||
            purchase?.supplier?.company ||
            index,
        );

        return (
          <DeliveredOrderCard
            key={rowId}
            purchase={purchase}
            isOpen={Boolean(openById[rowId])}
            onOpenChange={(nextOpen) =>
              setOpenById((prev) => ({ ...prev, [rowId]: nextOpen }))
            }
            onViewDetails={() => {
              setSelectedPurchase(purchase);
              setDetailsOpen(true);
            }}
          />
        );
      })}

      <CustomPagination
        title="Received order"
        datas={orders}
        page={page}
        maxPage={maxPage}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />

      <DeliveredDetailsModal
        open={detailsOpen}
        onOpenChange={(nextOpen) => {
          setDetailsOpen(nextOpen);
          if (!nextOpen) setSelectedPurchase(null);
        }}
        purchase={selectedPurchase}
      />
    </div>
  );
};

export default memo(ReceivedOrdersTab);
