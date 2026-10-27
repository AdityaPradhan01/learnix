import { LinkButton } from "@/components/ui/Button";
import { Tile } from "@/components/ui/Tile";

export default function CourseNotFound() {
  return (
    <div className="py-16 text-center">
      <Tile tone="pepper" className="mx-auto max-w-[480px] p-10">
        <div className="font-mono-label text-oxblood">Not found</div>
        <div className="mt-2 font-heading text-[20px] font-extrabold">This course doesn&apos;t exist</div>
        <p className="mt-2 text-[13.5px] text-graphite">
          It may have been removed from the catalogue. Head back to Explore to find something else.
        </p>
        <LinkButton href="/explore" variant="primary" className="mt-5">Back to Explore</LinkButton>
      </Tile>
    </div>
  );
}
