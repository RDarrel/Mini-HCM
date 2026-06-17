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
import ApprovedModal from "./approved-modal";
import { Eye } from "lucide-react";

const ApprovedRequestsTab = () => {
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
    return <TableLoading numberOfColumns={5} />;
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No approved requests
          </p>

          <p className="text-xs text-muted-foreground">
            Approved stock requests will show up here.
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
      <div className="overflow-hidden rounded-md border border-border bg-card/60">
        <Table className="border-collapse">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[70px]  text-center">#</TableHead>

              <TableHead className=" text-center">Date Requested</TableHead>

              <TableHead className=" text-center">Date Approved</TableHead>
              <TableHead className=" text-center">Requested Items</TableHead>
              <TableHead className=" text-center">Approved Items</TableHead>

              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {handlePagination(rows, page, maxPage).map((request, idx) => {
              const requestId = String(request?._id || "");

              const createdAt = request?.createdAt || null;

              const approvedAt = request?.admin?.reviewedAt || null;

              const createdLabel = createdAt ? Formatter.date(createdAt) : "-";

              const approvedLabel = approvedAt
                ? Formatter.date(approvedAt)
                : "-";

              const itemsCount = Array.isArray(request?.items)
                ? request.items.length
                : 0;

              const approvedItemsCount = Array.isArray(request?.items)
                ? request.items.filter((item) => !item?.deletedAt).length
                : 0;

              return (
                <TableRow key={requestId || createdLabel}>
                  <TableCell className=" text-center ">{idx + 1}</TableCell>

                  <TableCell className=" text-center ">
                    {createdLabel}
                  </TableCell>

                  <TableCell className=" text-center">
                    {approvedLabel}
                  </TableCell>
                  <TableCell className=" text-center ">
                    {itemsCount} item{itemsCount === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell className=" text-center ">
                    {approvedItemsCount} item
                    {approvedItemsCount === 1 ? "" : "s"}
                  </TableCell>

                  <TableCell className="text-center w-[120px]">
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

      <ApprovedModal
        open={detailsOpen}
        onOpenChange={(nextOpen) => {
          setDetailsOpen(Boolean(nextOpen));

          if (!nextOpen) {
            setSelectedRequest(null);
          }
        }}
        request={selectedRequest}
      />
    </div>
  );
};

export default memo(ApprovedRequestsTab);
