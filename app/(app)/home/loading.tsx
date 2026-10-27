import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[280px] w-full" />
      <div className="grid w-full grid-cols-3 gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
