import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Formatter, fullName } from "@/services/utilities";
import { CalendarRange, ClipboardList, FileX2, User } from "lucide-react";
import { memo, useMemo, useState } from "react";

const RejectReasonModal = ({
  open,
  onOpenChange,
  onConfirm,
  formSubmitted,
  request,
}) => {
  const [reason, setReason] = useState("");

  const createdLabel = request?.createdAt
    ? Formatter.date(request.createdAt)
    : "-";
  const itemsCount = Array.isArray(request?.items) ? request.items.length : 0;
  const requestedByName = useMemo(() => {
    const requestedBy = request?.requestedBy;
    if (requestedBy && typeof requestedBy === "object") {
      return fullName(requestedBy?.fullName || requestedBy);
    }
    return String(requestedBy || "Unknown");
  }, [request]);

  const canSubmit = useMemo(() => {
    return Boolean(String(reason || "").trim()) && Boolean(request?._id);
  }, [reason, request?._id]);

  const close = (nextOpen) => {
    const willOpen = Boolean(nextOpen);
    onOpenChange?.(willOpen);
    if (!willOpen) setReason("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit || formSubmitted) return;
    onConfirm?.(String(reason || "").trim());
  };

  return (
    <Dialog open={Boolean(open)} onOpenChange={close}>
      <DialogContent className="max-w-xl p-1">
        <form
          onSubmit={submit}
          className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto]"
        >
          <div className="rounded-t-xl border-b border-border bg-card/70 px-5 py-4 pr-16">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/70 shadow-sm">
                  <FileX2 className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="truncate text-lg">
                    Reject stock request
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-snug">
                    Add a reason before rejecting this request.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 space-y-4 overflow-auto px-5 pt-4">
            <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
              <div className="flex justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/70 shadow-sm">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        Requester
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {requestedByName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Date requested
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    {createdLabel}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Items requested
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums text-foreground sm:justify-end">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    {itemsCount} item{itemsCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border mb-5 bg-card/60 p-4 shadow-sm">
              <Label className="text-xs text-muted-foreground">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Type the reason for rejection..."
                className="mt-2 min-h-24 bg-background/40"
              />
            </div>
          </div>

          <div className="rounded-b-xl border-t border-border bg-card/70 px-5 py-4">
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => close(false)}
                disabled={formSubmitted}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!canSubmit || formSubmitted}
              >
                Reject request
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(RejectReasonModal);
