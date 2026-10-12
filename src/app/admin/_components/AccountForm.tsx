"use client";

import { useState } from "react";
import { api, ApiError, errorMessage } from "../_lib/api";
import { Alert, Button, Field, PageHeader, inputClass } from "./ui";

export function AccountForm({ email, role }: { email: string; role: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const submit = async () => {
    setBusy(true);
    setBanner(null);
    try {
      await api("/api/admin/me/password", { json: { currentPassword: current, newPassword: next } });
      setCurrent("");
      setNext("");
      setBanner({ kind: "success", text: "Password changed. Your other devices were signed out." });
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof ApiError && e.issues.length ? e.issues.map((i) => i.message).join(". ") : errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Account" subtitle={`${email} · ${role}`} />
      <form className="max-w-md flex flex-col gap-5" noValidate onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        {banner && <Alert kind={banner.kind}>{banner.text}</Alert>}
        <Field label="Current password" htmlFor="cur" required><input id="cur" type="password" autoComplete="current-password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
        <Field label="New password" htmlFor="new" help="At least 12 characters. A few random words make a strong passphrase." required><input id="new" type="password" autoComplete="new-password" className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <div><Button type="submit" loading={busy} disabled={!current || !next}>Change password</Button></div>
      </form>
    </>
  );
}
