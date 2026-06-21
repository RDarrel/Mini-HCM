import { Skeleton as UISkeleton } from "@/components/ui/skeleton";

const Skeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {new Array(4).fill("").map((_, index) => (
        <div key={index} className="rounded-md border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <UISkeleton className="h-3 w-24" />
            <UISkeleton className="size-4 rounded-full" />
          </div>
          <UISkeleton className="mt-3 h-7 w-16" />
          <UISkeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
