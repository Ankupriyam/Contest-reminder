import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-10 w-full" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="grid grid-cols-[1.7fr_1fr_1.1fr_0.7fr_0.9fr] items-center gap-3 px-5 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-4 w-44" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}
