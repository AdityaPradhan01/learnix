import { Skeleton } from "@/components/ui/Skeleton";

export default function ProgressLoading() {
  return (
    <div className="flex flex-col items-center gap-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-[280px] w-[280px] rounded-full" />
      <div className="grid w-full grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
