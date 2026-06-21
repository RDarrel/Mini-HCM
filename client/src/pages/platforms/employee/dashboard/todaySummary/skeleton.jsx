import { Skeleton } from "@/components/ui/skeleton";

const TodaySummarySkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {new Array(5).fill("").map((_, index) => (
          <div key={index} className="rounded-md border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-6 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-3">
        {new Array(3).fill("").map((_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaySummarySkeleton;
