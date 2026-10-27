import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Create account — Learnix" };

export default function SignupPage() {
  return (
    <div>
      <div className="font-mono-label text-oxblood">Create account</div>
      <h1 className="mb-1 mt-2 text-[30px] tracking-[-0.02em]">Start your recommendations</h1>
      <p className="mb-6 text-[13.5px] text-graphite">
        Takes a minute. You&apos;ll set your target role and constraints right after.
      </p>

      <SignupForm />

      <p className="mt-5 text-[13px] text-graphite">
        Already have an account?{" "}
        <Link href="/login" className="text-oxblood underline underline-offset-[3px] hover:text-oxblood-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
