import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";
import { Package } from "lucide-react";
import {
  formatQty,
  getItemKey,
  getOrderedQty,
  getUnitCost,
  round2,
  toNumber,
} from "./utils";

const ReceiveOrderItemsTable = ({
  items = [],
  setItems,
  minExpiryDate,
  counts,
  grandSubtotal,
  grandVariance,
}) => {
  const updateReceived = (key, value) => {
    setItems((prev) =>
      prev.map((entry) =>
        getItemKey(entry) === key
          ? {
              ...entry,
              quantity: {
                ...(entry?.quantity || {}),
                received: value,
              },
            }
          : entry,
      ),
    );
  };
  return (
    <div className="rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <Table className="min-w-[980px]">
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-muted/30">
            <TableHead className="px-5 text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              <span className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                Item
              </span>
            </TableHead>
            <TableHead className="px-5 text-right text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Ordered Qty
            </TableHead>
            <TableHead className="w-[280px] px-5 text-center text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Received Qty
            </TableHead>

            <TableHead className="w-[220px] px-5 text-center text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Shortage Qty
            </TableHead>
            <TableHead className="px-5 text-center text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Expiration Date
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => {
            const key = getItemKey(item);
            const name = item?.inventory?.name || item?.name || "Item";
            const unitRaw = String(item?.unit || "").trim();
            const unit = capitalize(unitRaw) || "";
            const expected = round2(getOrderedQty(item));
            const received = round2(toNumber(item?.quantity?.received));
            const discrepancy = round2(expected - received);
            const hasMismatch = discrepancy !== 0;
            const isOver = discrepancy < 0;
            const shortQty = Math.max(0, discrepancy);
            const unitCost = getUnitCost(item);
            const shortAmount =
              unitCost === null ? null : Math.max(0, shortQty) * unitCost;
            const receivedAmount =
              unitCost === null ? null : Math.max(0, received) * unitCost;
            const tracksExpiration = Boolean(
              item?.inventory?.trackExpiration ??
              item?.trackExpiration ??
              false,
            );

            const inputHighlightClass = hasMismatch
              ? isOver
                ? "border-destructive/60 focus-visible:ring-destructive/20"
                : "border-accent/60 focus-visible:ring-accent/20"
              : "";

            const isPieces =
              String(item?.inventory?.measurement || "") === "pieces";
            return (
              <TableRow
                key={key || name}
                className={`hover:bg-muted/5 ${hasMismatch ? "bg-destructive/5" : ""}`}
              >
                <TableCell className="whitespace-normal px-5 py-2.5">
                  <p className="truncate font-medium text-foreground">{name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {unitCost === null ? (
                      <span>Unit cost: -</span>
                    ) : (
                      <span>
                        Unit cost:{" "}
                        <span className="font-medium text-foreground/80">
                          {Formatter.amount(unitCost)} / {unit || "-"}
                        </span>
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-5 py-2.5 text-right font-semibold tabular-nums text-foreground">
                  {formatQty(expected)}{" "}
                  <span className="text-xs font-medium text-muted-foreground">
                    {unit || "-"}
                  </span>
                </TableCell>

                <TableCell className="w-[280px] px-5 py-2.5">
                  <div className="flex flex-col items-center gap-1">
                    <Label className="sr-only" htmlFor={`received-${key}`}>
                      Received quantity
                    </Label>
                    <div className="relative w-[140px]">
                      <Input
                        id={`received-${key}`}
                        type="number"
                        min={0}
                        max={expected}
                        step={isPieces ? 1 : 0.01}
                        inputMode={isPieces ? "numeric" : "decimal"}
                        value={item?.quantity?.received ?? ""}
                        onKeyDown={(event) => {
                          if (
                            event.key === "e" ||
                            event.key === "E" ||
                            event.key === "+" ||
                            event.key === "-"
                          ) {
                            event.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const raw = e.target.value;

                          if (raw === "") return updateReceived(key, "");
                          const cleaned = isPieces
                            ? raw.replace(/[^\d]/g, "") // bawal decimal
                            : raw.replace(/[^\d.]/g, "");

                          const num = Number(cleaned);

                          const clamped = Math.min(
                            expected,
                            Math.max(0, num || 0),
                          );

                          updateReceived(key, clamped, item);
                        }}
                        placeholder="0"
                        className={`h-8 w-full bg-background pr-12 text-right tabular-nums ${inputHighlightClass}`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        {unit || "-"}
                      </span>
                    </div>

                    <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">Amount</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {receivedAmount === null
                          ? "-"
                          : Formatter.amount(receivedAmount)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="w-[220px] px-5 py-2.5">
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative w-[140px]">
                      <Input
                        type="text"
                        value={formatQty(shortQty)}
                        disabled
                        className={`h-8 w-full border-dashed bg-muted/20 pr-12 text-right font-semibold tabular-nums disabled:cursor-not-allowed disabled:opacity-100 ${shortQty > 0 ? "border-destructive/40 text-destructive" : "border-border/70 text-muted-foreground"}`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        {unit || "-"}
                      </span>
                    </div>
                    <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">Amount</span>
                      <span
                        className={`font-semibold tabular-nums ${shortQty > 0 ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {shortAmount === null
                          ? "-"
                          : Formatter.amount(shortAmount)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-2.5">
                  <div className="mx-auto w-[150px]">
                    <Label className="sr-only" htmlFor={`expiry-${key}`}>
                      Expiration date
                    </Label>
                    <Input
                      id={`expiry-${key}`}
                      type="date"
                      min={minExpiryDate}
                      required
                      value={
                        tracksExpiration
                          ? String(item?.expirationDate ?? "")
                          : ""
                      }
                      disabled={!tracksExpiration}
                      onChange={(event) => {
                        if (!tracksExpiration) return;
                        const raw = event.target.value;
                        setItems((prev) =>
                          prev.map((entry) =>
                            getItemKey(entry) === key
                              ? { ...entry, expirationDate: raw }
                              : entry,
                          ),
                        );
                      }}
                      className="h-8 w-full bg-background text-sm disabled:cursor-not-allowed disabled:bg-muted/30"
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-2 border-t border-border bg-muted/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {counts.flagged
            ? `${counts.flagged} items do not match the order.`
            : "All items match the order.."}
        </div>
        <div className="flex items-baseline justify-between gap-6 sm:justify-end">
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
              Total Received
            </span>
            <div className="text-base font-semibold tabular-nums text-foreground">
              {Formatter.amount(grandSubtotal)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
              Total Difference
            </span>
            <div
              className={`text-base font-semibold tabular-nums ${grandVariance === 0 ? "text-muted-foreground" : "text-destructive"}`}
            >
              {Formatter.amount(grandVariance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveOrderItemsTable;
