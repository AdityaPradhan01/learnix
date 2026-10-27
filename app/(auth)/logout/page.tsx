import Link from "next/link";
import { auth } from "@/auth";
import { Button, LinkButton } from "@/components/ui/Button";
import { logoutAction } from "./actions";

export const metadata = { title: "Sign out — Learnix" };

export default async function LogoutPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div>
        <div className="font-mono-label text-oxblood">Signed out</div>
        <h1 className="mb-1 mt-2 text-[30px] tracking-[-0.02em]">You&apos;re already signed out</h1>
        <p className="mb-6 text-[13.5px] text-graphite">
          Sign back in to see your recommendations and saved courses.
        </p>
        <LinkButton href="/login" variant="primary">Sign in</LinkButton>
      </div>
    );
  }

  return (
    <div>
      <div className="font-mono-label text-oxblood">Sign out</div>
      <h1 className="mb-1 mt-2 text-[30px] tracking-[-0.02em]">Sign out of Learnix?</h1>
      <p className="mb-6 text-[13.5px] text-graphite">
        Signed in as <span className="text-ink">{session.user.email}</span>. Your saved
        courses, weights and settings stay put — they&apos;ll be here next time.
      </p>
      <form action={logoutAction} className="flex gap-3">
        <Button type="submit" variant="primary">Sign out</Button>
        <Link href="/home" className="pill flex items-center bg-pepper px-5 text-[14px] font-semibold text-ink hover:bg-stone">
          Cancel
        </Link>
      </form>
    </div>
  );
}
