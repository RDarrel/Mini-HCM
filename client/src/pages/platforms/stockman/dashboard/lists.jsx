import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  BROWSE as BROWSE_PURCHASES,
  INCOMING_ORDERS,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter, Stock } from "@/services/utilities";
import { PackageSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  EXPIRING_SOON_DAYS,
  formatDeliveryWindow,
  getItemsFromPurchase,
  normalizeStatus,
} from "./utils";

const renderListSkeleton = (rows = 5) => {
  return (
    <div className="max-h-64 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-background/40">
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

const Lists = () => {
  const token = useSelector(({ auth }) => auth?.token);
  const { collections: inventory = [], isLoading: inventoryLoading } =
    useSelector(({ inventoryItems }) => inventoryItems);
  const safeInventory = Array.isArray(inventory) ? inventory : [];

  const [incomingOrders, setIncomingOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    setIncomingLoading(true);
    dispatch(INCOMING_ORDERS({ token }))
      .unwrap()
      .then(({ payload = [] } = {}) => setIncomingOrders(payload || []))
      .catch(() => setIncomingOrders([]))
      .finally(() => setIncomingLoading(false));

    setReceivedLoading(true);
    dispatch(BROWSE_PURCHASES({ token, params: { status: "received" } }))
      .unwrap()
      .then(({ payload = [] } = {}) => setReceivedOrders(payload || []))
      .catch(() => setReceivedOrders([]))
      .finally(() => setReceivedLoading(false));
  }, [dispatch, token]);

  const safeIncoming = Array.isArray(incomingOrders) ? incomingOrders : [];
  const safeReceived = Array.isArray(receivedOrders) ? receivedOrders : [];

  const inventorySummary = useMemo(() => {
    const outOfStock = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "out of stock",
    );
    const lowStock = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "low stock",
    );

    const needsReorder = [...outOfStock, ...lowStock];

    return {
      count: needsReorder.length,
      needsReorder: needsReorder.slice(0, 8),
      loading: inventoryLoading && !safeInventory.length,
    };
  }, [inventoryLoading, safeInventory]);

  const expiringSoon = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + EXPIRING_SOON_DAYS);

    const rows = [];

    for (const purchase of safeReceived) {
      const items = getItemsFromPurchase(purchase);
      for (const item of Array.isArray(items) ? items : []) {
        const tracksExpiration = Boolean(
          item?.inventory?.trackExpiration ?? item?.trackExpiration ?? false,
        );
        if (!tracksExpiration) continue;

        const raw = item?.expirationDate;
        if (!raw) continue;

        const expiry = new Date(raw);
        if (Number.isNaN(expiry.getTime())) continue;
        if (expiry < now || expiry > cutoff) continue;

        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        const name = item?.inventory?.name || item?.name || "Item";

        rows.push({
          key: String(item?._id || item?.inventory?._id || name),
          _id: item?._id,
          name,
          expiry,
          daysLeft,
        });
      }
    }

    rows.sort((a, b) => a.expiry - b.expiry);

    return {
      count: rows.length,
      rows: rows.slice(0, 6),
    };
  }, [safeReceived]);

  const incomingSummary = useMemo(() => {
    return {
      count: safeIncoming.length,
      recent: safeIncoming.slice(0, 6),
    };
  }, [safeIncoming]);

  return (
    <>
      <Card className="gap-3 py-4 lg:col-span-4">
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Replenishment queue</CardTitle>
            <CardDescription className="text-xs">
              Out-of-stock items first, then low-stock items.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full">
            {inventoryLoading && !safeInventory.length
              ? "Loading..."
              : inventorySummary.count
                ? `${inventorySummary.count} alerts`
                : "OK"}
          </Badge>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          {inventorySummary.loading ? (
            renderListSkeleton(4)
          ) : inventorySummary.needsReorder.length ? (
            <div className="max-h-64 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-background/40">
              <Table className="w-full table-fixed">
                <TableBody>
                  {inventorySummary.needsReorder.map((item, index) => {
                    const status = normalizeStatus(item?.stockStatus);
                    const isOut = status === "out of stock";

                    return (
                      <TableRow key={item?._id || index}>
                        <TableCell className="py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {item?.name || "Item"}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {Stock.display(
                                item?.stockDisplay?.current,
                                item?.measurement,
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Badge
                            variant="outline"
                            className={
                              isOut
                                ? "rounded-full border-destructive/30 bg-destructive/5 text-destructive"
                                : "rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            }
                          >
                            {isOut ? "Out of stock" : "Low stock"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {inventoryLoading ? "Loading inventory..." : "No reorder needed."}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="gap-3 py-4 lg:col-span-4">
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Expiring soon</CardTitle>
            <CardDescription className="text-xs">
              Items expiring within {EXPIRING_SOON_DAYS} days.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              expiringSoon.count
                ? "rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "rounded-full"
            }
          >
            {receivedLoading
              ? "Loading..."
              : expiringSoon.count
                ? `${expiringSoon.count} item(s)`
                : "OK"}
          </Badge>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          {receivedLoading && !safeReceived.length ? (
            renderListSkeleton(4)
          ) : expiringSoon.rows.length ? (
            <div className="max-h-64 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-background/40">
              <Table className="w-full table-fixed">
                <TableBody>
                  {expiringSoon.rows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {row.name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {row.daysLeft < 0 ? (
                              <>
                                Expired on {Formatter.date(row.expiry)} •{" "}
                                {Math.abs(row.daysLeft)} day(s) ago
                              </>
                            ) : row.daysLeft === 0 ? (
                              <>Expires today</>
                            ) : (
                              <>
                                Expires on {Formatter.date(row.expiry)} •{" "}
                                {row.daysLeft} day(s) left
                              </>
                            )}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="py-2 text-right">
                        {row.daysLeft < 0 ? (
                          <Badge
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/platforms/inventory?id=${row._id}&&name=${row.name}`,
                              )
                            }
                            className="cursor-pointer rounded-full border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                          >
                            Dispose
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          >
                            Soon
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {receivedLoading
                ? "Loading expiry data..."
                : "No items expiring."}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="gap-3 py-4 lg:col-span-4">
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Incoming deliveries</CardTitle>
            <CardDescription className="text-xs">
              Supplier orders to receive and verify.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full">
            {incomingLoading
              ? "Loading..."
              : incomingSummary.count
                ? `${incomingSummary.count} incoming`
                : "0"}
          </Badge>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          {incomingLoading && !safeIncoming.length ? (
            renderListSkeleton(4)
          ) : incomingSummary.recent.length ? (
            <div className="max-h-64 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-background/40">
              <Table className="w-full table-fixed">
                <TableBody>
                  {incomingSummary.recent.map((purchase, index) => (
                    <TableRow
                      key={`${purchase?._id || purchase?.supplier?._id || "po"}_${index}`}
                    >
                      <TableCell className="max-w-0 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {purchase?.supplier?.name || "Supplier"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDeliveryWindow(purchase?.deliveryWindow)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex justify-end">
                          <Badge
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/platforms/orders/${purchase?.status === "redelivery" ? "short-deliveries" : "order-list"}?status=${encodeURIComponent(
                                  purchase?.status || "incoming",
                                )}&purchase=${encodeURIComponent(purchase?._id)}`,
                              )
                            }
                            className="gap-1 rounded-full whitespace-nowrap cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground hover:border-border"
                          >
                            <PackageSearch className="h-3.5 w-3.5" />
                            View
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {incomingLoading ? "Loading orders..." : "No incoming orders."}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Lists;
