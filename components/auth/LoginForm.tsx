"use client";

import { useActionState } from "react";
import { Checkbox, Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { loginAction, type LoginState } from "@/app/(auth)/login/actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@school.edu" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </Field>

      <Checkbox name="remember">
        Remember me
        <span className="block text-[12px] text-graphite">
          Stay signed in on this device for 30 days. Otherwise you&apos;ll be asked to sign in again after a day.
        </span>
      </Checkbox>

      {state.error && (
        <div className="pill bg-oxblood/10 px-4 py-2.5 text-[13px] text-oxblood">{state.error}</div>
      )}

      <Button type="submit" variant="primary" block disabled={pending} className="mt-1">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
