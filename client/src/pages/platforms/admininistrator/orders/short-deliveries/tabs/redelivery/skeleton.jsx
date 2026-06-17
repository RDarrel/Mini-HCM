import { Skeleton } from "@/components/ui/skeleton";

const OrderSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);
const IncomingSkeleton = () => {
  return (
    <div className="space-y-3">
      <OrderSkeleton />
      <OrderSkeleton />
      <OrderSkeleton />
    </div>
  );
};

export default IncomingSkeleton;
