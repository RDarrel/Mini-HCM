import CustomPagination from "@/components/shared/pagination";
import { memo, useState } from "react";
import { useSelector } from "react-redux";
import DeliveredDetailsModal from "./details-modal";
import DeliveredOrderCard from "./order-card";
import DeliveredSkeleton from "./skeleton";
import { handlePagination } from "@/services/utilities";
import useHighlightPurchase from "../../use-highlight-purchase";

const ReceivedOrdersTab = ({ highlightPurchaseId = null }) => {
  const { filtered: rows, isLoading } = useSelector(
    ({ purchases }) => purchases,
  );
  const [openById, setOpenById] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);

  useHighlightPurchase({
    highlightPurchaseId,
    rows,
    page,
    pageSize: maxPage,
    setPage,
    setOpenById,
  });

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
        const purchaseId = String(purchase?._id || index);

        return (
          <DeliveredOrderCard
            key={purchaseId}
            purchase={purchase}
            wrapperId={`short-delivery-${purchaseId}`}
            wrapperClassName={
              highlightPurchaseId && String(highlightPurchaseId) === purchaseId
                ? "ring-2 ring-primary/40"
                : ""
            }
            isOpen={Boolean(openById[purchaseId])}
            onOpenChange={(nextOpen) =>
              setOpenById((prev) => ({ ...prev, [purchaseId]: nextOpen }))
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
        datas={rows}
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
