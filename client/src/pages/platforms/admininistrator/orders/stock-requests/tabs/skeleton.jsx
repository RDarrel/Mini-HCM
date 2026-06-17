import { Skeleton } from "@/components/ui/skeleton";

const RequestSkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
    <div className="mt-4">
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

const StockRequestsSkeleton = () => {
  return (
    <div className="space-y-3">
      <RequestSkeletonCard />
      <RequestSkeletonCard />
      <RequestSkeletonCard />
    </div>
  );
};

export default StockRequestsSkeleton;

