"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signupAction, type SignupState } from "@/app/(auth)/signup/actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signupAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Full name" htmlFor="name">
        <Input id="name" name="name" type="text" required autoComplete="name" placeholder="R. Advani" />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@school.edu" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>

      {state.error && (
        <div className="pill bg-oxblood/10 px-4 py-2.5 text-[13px] text-oxblood">{state.error}</div>
      )}

      <Button type="submit" variant="primary" block disabled={pending} className="mt-1">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
