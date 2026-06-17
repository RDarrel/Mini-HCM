import CustomPagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Formatter, handlePagination } from "@/services/utilities";
import { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import TableLoading from "@/components/shared/loading/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DetailsModal from "./details-modal";

const RejectedRequestsTab = () => {
  const { filtered: requests, isLoading } = useSelector(
    ({ stockRequests }) => stockRequests,
  );

  const rows = useMemo(
    () => (Array.isArray(requests) ? requests : []),
    [requests],
  );

  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  if (isLoading) {
    return <TableLoading numberOfColumns={3} />;
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No rejected requests
          </p>
          <p className="text-xs text-muted-foreground">
            Rejected stock requests will show up here.
          </p>
        </div>
      </div>
    );
  }

  const openDetails = (request) => {
    setSelectedRequest(request || null);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-card/60 ">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Date requested</TableHead>
              <TableHead>Date rejected</TableHead>
              <TableHead className="w-[140px]">Rejected items</TableHead>
              <TableHead className="w-[120px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {handlePagination(rows, page, maxPage).map((request, idx) => {
              const requestId = String(request?._id || "");
              const createdAt = request?.createdAt || null;
              const createdLabel = createdAt ? Formatter.date(createdAt) : "-";
              const itemsCount = Array.isArray(request?.items)
                ? request.items.length
                : 0;

              return (
                <TableRow key={requestId || createdLabel}>
                  <TableCell className="text-foreground">{idx + 1}</TableCell>
                  <TableCell className=" text-foreground">
                    {createdLabel}
                  </TableCell>
                  <TableCell className=" text-foreground">
                    {createdLabel}
                  </TableCell>
                  <TableCell className=" text-foreground tabular-nums">
                    {itemsCount} item{itemsCount === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => openDetails(request)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <CustomPagination
        title="request"
        datas={rows}
        page={page}
        maxPage={maxPage}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />

      <DetailsModal
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

export default memo(RejectedRequestsTab);
