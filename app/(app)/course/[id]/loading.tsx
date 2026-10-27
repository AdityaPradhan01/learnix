import { Skeleton } from "@/components/ui/Skeleton";

export default function CourseLoading() {
  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-[60%]" />
      <Skeleton className="h-[250px] w-[250px] rounded-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
