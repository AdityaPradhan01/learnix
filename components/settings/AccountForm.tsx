"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { updateAccountAction, type AccountState } from "@/app/(app)/settings/actions";

interface AccountFormProps {
  name: string;
  email: string;
  program: string;
  year: number;
}

export function AccountForm({ name, email, program, year }: AccountFormProps) {
  const [state, formAction, pending] = useActionState<AccountState, FormData>(updateAccountAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-[440px]">
      <Field label="Full name" htmlFor="name">
        <Input id="name" name="name" type="text" required defaultValue={name} />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required defaultValue={email} />
      </Field>
      <Field label="Program" htmlFor="program">
        <Input id="program" name="program" type="text" required defaultValue={program} />
      </Field>
      <Field label="Year" htmlFor="year">
        <Select id="year" name="year" defaultValue={year}>
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </Select>
      </Field>

      {state.error && (
        <div className="pill bg-oxblood/10 px-4 py-2.5 text-[13px] text-oxblood">{state.error}</div>
      )}
      {state.success && (
        <div className="pill bg-ink/10 px-4 py-2.5 text-[13px] text-ink">Saved.</div>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
