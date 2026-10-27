import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — Learnix" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div>
      <div className="font-mono-label text-oxblood">Sign in</div>
      <h1 className="mb-1 mt-2 text-[30px] tracking-[-0.02em]">Welcome back</h1>
      <p className="mb-6 text-[13.5px] text-graphite">
        Sign in to see your recommendations, saved courses and progress.
      </p>

      {error === "session-expired" && (
        <div className="pill mb-5 bg-oxblood/10 px-4 py-2.5 text-[13px] text-oxblood">
          Your session expired — sign in again to continue.
        </div>
      )}

      <LoginForm callbackUrl={callbackUrl ?? "/home"} />

      <p className="mt-5 text-[13px] text-graphite">
        New here?{" "}
        <Link href="/signup" className="text-oxblood underline underline-offset-[3px] hover:text-oxblood-hover">
          Create an account
        </Link>
      </p>
    </div>
  );
}
