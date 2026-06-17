import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TriangleAlert, Package, PackageCheck } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { normalizeStatus } from "./utils";

const renderKpiCard = ({
  tone,
  title,
  description,
  value,
  footnote,
  badge,
}) => {
  const toneClasses =
    tone === "danger"
      ? "from-destructive/8 via-transparent to-transparent"
      : tone === "warn"
        ? "from-amber-500/10 via-transparent to-transparent"
        : "from-emerald-500/10 via-transparent to-transparent";

  return (
    <Card
      className={`gap-3 bg-gradient-to-br py-4 ${toneClasses} lg:col-span-4`}
    >
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3 px-4 pt-0">
        <div>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{footnote}</p>
        </div>
        {badge}
      </CardContent>
    </Card>
  );
};

const KpiSkeleton = () => {
  return (
    <div className="grid gap-2 lg:col-span-12 lg:grid-cols-12">
      {[0, 1, 2].map((key) => (
        <Card key={key} className="gap-3 py-4 lg:col-span-4">
          <CardHeader className="space-y-2 px-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-3 px-4 pt-0">
            <div className="space-y-2">
              <Skeleton className="h-7 w-14" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const Summary = () => {
  const { collections: inventory = [], isLoading } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );

  const safeInventory = Array.isArray(inventory) ? inventory : [];

  const summary = useMemo(() => {
    const out = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "out of stock",
    );
    const low = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "low stock",
    );
    const inStock = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "in stock",
    );

    return {
      outCount: out.length,
      lowCount: low.length,
      inCount: inStock.length,
      total: safeInventory.length,
    };
  }, [safeInventory]);

  if (isLoading && !safeInventory.length) return <KpiSkeleton />;

  return (
    <div className="grid gap-2 lg:col-span-12 lg:grid-cols-12">
      {renderKpiCard({
        tone: "ok",
        title: (
          <>
            <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            In stock
          </>
        ),
        description: "Healthy items",
        value: summary.inCount,
        footnote: `Inventory ${isLoading ? "syncing" : "updated"}`,
        badge: (
          <Badge className="rounded-full" variant="secondary">
            {isLoading ? "Loading..." : "Up to date"}
          </Badge>
        ),
      })}

      {renderKpiCard({
        tone: "warn",
        title: (
          <>
            <Package className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            Low stock
          </>
        ),
        description: "Below reorder level",
        value: summary.lowCount,
        footnote: "Watch",
        badge: (
          <Badge
            variant="outline"
            className={
              summary.lowCount
                ? "rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "rounded-full border-border"
            }
          >
            {summary.lowCount ? "Reorder soon" : "No issues"}
          </Badge>
        ),
      })}
      {renderKpiCard({
        tone: "danger",
        title: (
          <>
            <TriangleAlert className="h-4 w-4 text-destructive" />
            Out of stock
          </>
        ),
        description: "Immediate reorder required",
        value: summary.outCount,
        footnote: `${summary.total} items tracked`,
        badge: (
          <Badge
            variant="outline"
            className={
              summary.outCount
                ? "rounded-full border-destructive/30 bg-destructive/5 text-destructive"
                : "rounded-full border-border"
            }
          >
            {summary.outCount ? "Urgent" : "No issues"}
          </Badge>
        ),
      })}
    </div>
  );
};

export default Summary;
