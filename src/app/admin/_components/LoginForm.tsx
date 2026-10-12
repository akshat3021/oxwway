"use client";

import { useState } from "react";
import { api, ApiError, errorMessage } from "../_lib/api";
import { Alert, Button, Field, inputClass } from "./ui";

export function LoginForm({ expired }: { expired: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/login", { json: { email, password } });
      // Full navigation so the server renders the panel with the new cookie.
      window.location.assign("/admin");
    } catch (e) {
      setError(e instanceof ApiError && e.status === 422 ? "Enter a valid email and password." : errorMessage(e));
      setPassword("");
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }} className="flex flex-col gap-5">
      {expired && !error && <Alert kind="info">Your session has ended. Please sign in again.</Alert>}
      {error && <Alert kind="error">{error}</Alert>}
      <Field label="Email" htmlFor="email">
        <input id="email" type="email" autoComplete="username" autoFocus required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="password">
        <input id="password" type="password" autoComplete="current-password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Button type="submit" loading={busy} disabled={!email || !password}>Sign in</Button>
    </form>
  );
}
