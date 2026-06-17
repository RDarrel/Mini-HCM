import CustomPagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Formatter, handlePagination } from "@/services/utilities";
import { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import TableLoading from "@/components/shared/loading/table";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ViewModal from "./view-modal";
import { useDispatch } from "react-redux";
import { DESTROY } from "@/services/redux/slices/procurement/stock-requests";
import { toast } from "sonner";
import { CustomAlert } from "@/components/shared/alert";
import { CircleX, Eye, Pencil } from "lucide-react";
import PendingUpdateModal from "./pending-update-modal";

const PendingRequestsTab = () => {
  const {
    filtered: requests,
    isLoading,
    formSubmitted,
  } = useSelector(({ stockRequests }) => stockRequests);
  const { token } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();

  const rows = useMemo(
    () => (Array.isArray(requests) ? requests : []),
    [requests],
  );

  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  if (isLoading) {
    return <TableLoading numberOfColumns={3} />;
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No pending requests
          </p>
          <p className="text-xs text-muted-foreground">
            Stock requests awaiting review will show up here.
          </p>
        </div>
      </div>
    );
  }

  const openDetails = (request) => {
    setSelectedRequest(request || null);
    setDetailsOpen(true);
  };

  const openUpdate = (request) => {
    setUpdateTarget(request || null);
    setUpdateOpen(true);
  };

  const openCancel = (request) => {
    setCancelTarget(request || null);
    setCancelOpen(true);
  };

  const setCancelDialogOpen = (nextOpen) => {
    setCancelOpen(Boolean(nextOpen));
    if (!nextOpen) setCancelTarget(null);
  };

  const confirmCancel = () => {
    const requestId = String(cancelTarget?._id || "");
    if (!requestId || !token) {
      toast.error("Unable to cancel request. Please try again.");
      return;
    }

    dispatch(DESTROY({ data: { _id: requestId }, token }))
      .unwrap()
      .then(() => {
        toast.success("Request cancelled.");
        setCancelDialogOpen(false);
      })
      .catch(() => {
        toast.error("Failed to cancel request. Please try again.");
      });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border border-border bg-card/60">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Date Requested</TableHead>
              <TableHead>Items Requested</TableHead>
              <TableHead className="w-[160px] text-center">Action</TableHead>
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
                  <TableCell className=" text-foreground">{idx + 1}</TableCell>
                  <TableCell className=" text-foreground">
                    {createdLabel}
                  </TableCell>
                  <TableCell className="text-foreground tabular-nums">
                    {itemsCount} item{itemsCount === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell className="text-right">
                    <ButtonGroup>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full w-12"
                        onClick={() => openDetails(request)}
                        title="View items"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full w-12"
                        onClick={() => openUpdate(request)}
                        title="Update request"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-full w-12"
                        onClick={() => openCancel(request)}
                        disabled={!requestId}
                        title="Cancel request"
                      >
                        <CircleX className="h-4 w-4" />
                      </Button>
                    </ButtonGroup>
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

      <ViewModal
        open={detailsOpen}
        onOpenChange={(nextOpen) => {
          setDetailsOpen(Boolean(nextOpen));
          if (!nextOpen) setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      <PendingUpdateModal
        open={updateOpen}
        onOpenChange={(nextOpen) => {
          setUpdateOpen(Boolean(nextOpen));
          if (!nextOpen) setUpdateTarget(null);
        }}
        request={updateTarget}
      />

      <CustomAlert
        isOpen={cancelOpen}
        setIsOpen={setCancelDialogOpen}
        capture={() => confirmCancel()}
        formSubmitted={formSubmitted}
        showCancelButton
        className="w-[22rem]"
        buttonTitle="Yes, cancel it"
        buttonClassName="bg-destructive  hover:bg-destructive/90"
        index={0}
        message={
          <>
            Cancel this stock request? This will remove it from your pending
            list.
          </>
        }
      />
    </div>
  );
};

export default memo(PendingRequestsTab);
