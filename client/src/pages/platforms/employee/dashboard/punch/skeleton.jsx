import { Skeleton } from "@/components/ui/skeleton";

const PunchSkeleton = () => {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-3 sm:grid-cols-3">
        {new Array(3).fill("").map((_, index) => (
          <div key={index} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="mt-3 h-5 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
};

export default PunchSkeleton;
