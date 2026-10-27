import { Skeleton } from "@/components/ui/Skeleton";

export default function ExploreLoading() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-16 w-full max-w-[640px] rounded-full" />
      <div className="grid w-full grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52" />
        ))}
      </div>
    </div>
  );
}
