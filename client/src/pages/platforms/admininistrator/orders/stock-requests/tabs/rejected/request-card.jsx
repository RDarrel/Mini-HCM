import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Formatter, fullName } from "@/services/utilities";
import { memo, useMemo } from "react";
import {
  CalendarRange,
  ChevronDown,
  ClipboardList,
  Clock,
  Eye,
  XCircle,
} from "lucide-react";
import { getStockRequestStatusMeta } from "../../utils";

const RejectedStockRequestCard = ({
  request,
  isOpen,
  onOpenChange,
  onViewDetails,
}) => {
  const meta = useMemo(() => {
    const statusKey = String(request?.status || "pending").toLowerCase();
    return getStockRequestStatusMeta(statusKey);
  }, [request]);

  const requestId = String(request?._id || "");
  const requestedByName = useMemo(() => {
    const requestedBy = request?.requestedBy;
    if (requestedBy && typeof requestedBy === "object") {
      return fullName(requestedBy?.fullName || requestedBy);
    }
    return String(requestedBy || "Unknown");
  }, [request]);

  const createdAt = request?.createdAt
    ? Formatter.date(request.createdAt)
    : "-";
  const rejectedAt = request?.admin?.reviewedAt
    ? Formatter.date(request.admin.reviewedAt)
    : "-";

  const items = useMemo(() => {
    return Array.isArray(request?.items) ? request.items : [];
  }, [request?.items]);
  const itemsCount = items.length;

  const StatusIcon = meta.icon || XCircle;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-foreground">
              {requestedByName}
            </p>
            <Badge
              variant="outline"
              className={`rounded-full ${meta.className}`}
            >
              <StatusIcon className="h-3 w-3" />
              {meta.label}
            </Badge>
          </div>

          <p className="truncate text-xs text-muted-foreground">
            Email:{" "}
            <span className="font-medium text-foreground/90">
              {request?.requestedBy?.email || "-"}
            </span>
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 gap-2"
              disabled={!requestId}
              onClick={() => {
                if (!requestId) return;
                onViewDetails?.(request);
              }}
            >
              <Eye className="h-4 w-4" />
              View details
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-background/40 p-3 text-sm">
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Date requested</p>
                <p className="truncate font-semibold text-foreground">
                  {createdAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Date rejected</p>
                <p className="truncate font-semibold text-foreground">
                  {rejectedAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                {itemsCount ? (
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto w-full justify-start p-0 text-left hover:bg-transparent"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs text-muted-foreground">
                          Rejected items
                        </span>
                        <span className="flex min-w-0 items-center gap-1 font-semibold leading-none tabular-nums text-foreground">
                          <span className="truncate leading-none">
                            {itemsCount} item(s)
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 mt-1 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </span>
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                ) : (
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Items rejected
                    </p>
                    <p className="truncate font-semibold tabular-nums text-foreground">
                      0 item(s)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {itemsCount ? (
            <CollapsibleContent className="mt-3">
              <div className="overflow-hidden rounded-xl border border-border bg-card/40">
                <div className="grid grid-cols-[1fr_180px] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">
                  <span>Item</span>
                  <span className="text-right">Requested Qty</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <div className="divide-y divide-border/70">
                    {items.map((item, idx) => {
                      const inventoryId = String(
                        item?.inventory?._id || item?.inventory || "",
                      );
                      const inventoryName = String(
                        item?.inventory?.name || "",
                      ).trim();
                      const requestedQty = Number(item?.quantity?.request ?? 0);
                      const unit = String(item?.unit || "").toLowerCase();

                      const rowKey = String(item?._id || inventoryId || idx);
                      const label = inventoryName
                        ? inventoryName
                        : inventoryId
                          ? `Inventory: ${inventoryId}`
                          : "Item";

                      return (
                        <div
                          key={rowKey}
                          className="grid grid-cols-[1fr_180px] items-center gap-2 px-3 py-2 text-sm"
                        >
                          <span className="truncate font-medium text-foreground">
                            {label}
                          </span>
                          <span className="text-right font-semibold tabular-nums text-foreground">
                            {Number.isFinite(requestedQty) ? requestedQty : 0}{" "}
                            {unit ? (
                              <span className="text-xs font-medium text-muted-foreground">
                                {unit}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          ) : null}
        </Collapsible>
      </div>
    </div>
  );
};

export default memo(RejectedStockRequestCard);
