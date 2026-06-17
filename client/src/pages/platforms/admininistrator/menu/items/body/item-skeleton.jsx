import { Skeleton } from "@/components/ui/skeleton";

const ItemSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <div className="relative h-52 overflow-hidden rounded-t-2xl bg-muted/40">
      <Skeleton className="h-full w-full rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="absolute top-2 flex w-full items-start justify-between gap-1.5 px-2">
        <Skeleton className="h-7 w-28 rounded-full" />

        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-[30px] w-[30px] rounded-full" />
          <Skeleton className="h-[30px] w-[30px] rounded-full" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>

    <div className="flex flex-1 flex-col bg-card px-4 pb-3 pt-3 rounded-b-2xl border-x border-b border-border">
      <div className="mt-0 flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/10 px-3 py-2.5">
        <div className="flex min-w-0 items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default ItemSkeleton;
