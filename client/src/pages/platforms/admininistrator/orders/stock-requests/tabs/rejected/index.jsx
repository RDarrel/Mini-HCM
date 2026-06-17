import CustomPagination from "@/components/shared/pagination";
import { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { handlePagination } from "@/services/utilities";
import StockRequestsSkeleton from "../skeleton";
import RejectedRequestDetailsModal from "./details-modal";
import RejectedStockRequestCard from "./request-card";

const RejectedStockRequestsTab = () => {
  const { filtered: requests, isLoading } = useSelector(
    ({ stockRequests }) => stockRequests,
  );
  const rows = useMemo(() => {
    const safe = Array.isArray(requests) ? requests : [];
    return safe.filter(
      (row) => String(row?.status || "").toLowerCase() === "rejected",
    );
  }, [requests]);
  const [openById, setOpenById] = useState({});
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  if (isLoading) {
    return <StockRequestsSkeleton />;
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No rejected requests
          </p>
          <p className="text-xs text-muted-foreground">
            Rejected stock requests will appear here for reference.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {handlePagination(rows, page, maxPage).map((request, index) => {
        const rowId = String(request?._id || index);
        return (
          <RejectedStockRequestCard
            key={rowId}
            request={request}
            isOpen={Boolean(openById[rowId])}
            onOpenChange={(nextOpen) =>
              setOpenById((prev) => ({ ...prev, [rowId]: nextOpen }))
            }
            onViewDetails={(row) => {
              setSelectedRequest(row);
              setDetailsOpen(true);
            }}
          />
        );
      })}

      <CustomPagination
        title="Stock request"
        datas={rows}
        page={page}
        maxPage={maxPage}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />

      <RejectedRequestDetailsModal
        open={detailsOpen}
        onOpenChange={(nextOpen) => {
          setDetailsOpen(Boolean(nextOpen));
          if (!nextOpen) setSelectedRequest(null);
        }}
        request={selectedRequest}
      />
    </div>
  );
};

export default memo(RejectedStockRequestsTab);
