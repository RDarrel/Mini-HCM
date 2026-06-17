import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomAlert } from "@/components/shared/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter, Stock } from "@/services/utilities";
import { Boxes, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DISPOSE } from "@/services/redux/slices/inventory/stockBatch";
import { DISPOSE as DISPOSE_INVENTORY_EXPIRED } from "@/services/redux/slices/inventory/inventoryItems";
const BatchesModalBody = ({
  rows = [],
  isLoading = false,
  tableColSpan = 7,
  tracksExpiration = true,
  formatQty,
  statusBadge,
  onConfirmDispose,
}) => {
  const { auth, token } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ stockBatch }) => stockBatch);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const dispatch = useDispatch();
  const handleRequestDispose = (batch) => {
    setSelectedBatch(batch || null);
    setDisposeOpen(true);
  };

  const handleConfirmDispose = () => {
    try {
      onConfirmDispose?.(selectedBatch);
    } finally {
      dispatch(
        DISPOSE({
          token,
          data: {
            _id: selectedBatch._id,
            inventory: selectedBatch.inventory?._id,
            qty: selectedBatch.remainingQuantity,
            user: auth?._id,
            unit: selectedBatch.unit,
          },
        }),
      )
        .unwrap()
        .then(() => {
          dispatch(
            DISPOSE_INVENTORY_EXPIRED({
              inventory: selectedBatch.inventory?._id,
              remainingQty: {
                display: selectedBatch.remainingQtyDisplay,
                value: selectedBatch.remainingQuantity,
              },
            }),
          );
          setDisposeOpen(false);
          setSelectedBatch(null);
        });
    }
  };
  const isAdmin = auth?.role === 1;
  return (
    <>
      <div className="overflow-hidden rounded-[7px] border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead className="text-right">Received Qty</TableHead>
              <TableHead className="text-right">Remaining Qty</TableHead>
              {isAdmin && (
                <TableHead className="text-right">Unit Cost</TableHead>
              )}
              <TableHead>Received Date</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {tracksExpiration ? (
                <TableHead className="text-center">Action</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tableColSpan} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/40">
                      <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Loading batches
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please wait a moment...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((batch) => {
                const badge = statusBadge(batch.status);
                return (
                  <TableRow key={batch._id}>
                    <TableCell className="whitespace-normal">
                      <p className="font-medium text-foreground">
                        {batch.displayCode}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {batch.supplierName}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-normal text-muted-foreground">
                      <p className="tabular-nums text-foreground">
                        {Stock.format(batch?.qtyDisplay)}
                        <span className="text-xs text-muted-foreground ml-1">
                          {batch.unit}
                        </span>
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      <p className="font-medium tabular-nums text-foreground">
                        {Stock.format(batch?.remainingQtyDisplay)}
                        <span className="text-xs text-muted-foreground ml-1">
                          {batch.unit}
                        </span>
                      </p>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right  text-foreground">
                        <p className="font-medium tabular-nums text-foreground">
                          ₱{batch.costPerUnit}
                          <span className="text-xs text-muted-foreground ml-1">
                            / {batch.unit}
                          </span>
                        </p>
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">
                      {batch.receivedDate
                        ? Formatter.date(batch.receivedDate)
                        : "—"}
                    </TableCell>

                    <TableCell className="font-semibold text-foreground">
                      {batch.expirationDate
                        ? Formatter.date(batch.expirationDate)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </TableCell>
                    {tracksExpiration ? (
                      <TableCell className="text-center">
                        {batch.isExpired ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestDispose(batch)}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            Dispose
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full border border-border bg-muted/30 p-3">
                      <Boxes className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        No stock batches found
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Stock batch records will appear here once supplier
                        deliveries are received.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CustomAlert
        isOpen={disposeOpen}
        formSubmitted={formSubmitted}
        capture={handleConfirmDispose}
        setIsOpen={setDisposeOpen}
        showCancelButton
        className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]"
        buttonTitle="Dispose Batch"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={0}
        message={
          <>
            <p>
              Are you sure you want to dispose{" "}
              <span className="font-semibold text-red-600">
                {selectedBatch?.displayCode || "this batch"}
              </span>
              ?
            </p>

            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Batch:</span>{" "}
                {selectedBatch?.displayCode || "â€”"}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Remaining Qty:
                </span>{" "}
                {selectedBatch
                  ? (formatQty?.(selectedBatch?.remainingQtyDisplay) ?? "â€”")
                  : "â€”"}
              </p>
              {tracksExpiration ? (
                <p>
                  <span className="font-medium text-foreground">
                    Expiration:
                  </span>{" "}
                  {selectedBatch?.expirationDate
                    ? Formatter.date(selectedBatch.expirationDate)
                    : "â€”"}
                </p>
              ) : null}

              <p className="pt-2 text-xs leading-5 text-muted-foreground">
                This action will remove the expired stock from pending disposal
                records.
              </p>
            </div>
          </>
        }
      />
    </>
  );
};

export default BatchesModalBody;
