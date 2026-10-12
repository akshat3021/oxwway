"use client";

import { useState } from "react";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string; fields: Record<string, string> };

const field = "w-full bg-transparent border border-foreground/20 px-4 py-3 font-mono text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent aria-[invalid=true]:border-red-500";
const label = "font-mono text-[10px] uppercase tracking-widest text-foreground/60";

export function ContactForm() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          website: String(data.get("website") ?? ""),
        }),
      });
      if (res.ok) {
        form.reset();
        setState({ kind: "sent" });
        return;
      }
      const body = (await res.json().catch(() => null)) as { error?: { message?: string; details?: { path: string; message: string }[] } } | null;
      const fields: Record<string, string> = {};
      for (const d of body?.error?.details ?? []) fields[d.path] ||= d.message;
      setState({
        kind: "error",
        fields,
        message: res.status === 429 ? "Too many messages. Please try again in a few minutes." : Object.keys(fields).length ? "Please check the highlighted fields." : "We couldn't send your message. Please try again.",
      });
    } catch {
      setState({ kind: "error", fields: {}, message: "Network error. Please check your connection and try again." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div role="status" className="border border-accent/40 p-8 font-mono text-sm">
        <div className="text-accent uppercase tracking-widest text-[10px] mb-3">[ TRANSMISSION RECEIVED ]</div>
        Thank you. We have your message and will reply by email.
        <button className="block mt-6 text-xs uppercase tracking-widest text-accent underline underline-offset-4" onClick={() => setState({ kind: "idle" })}>Send another</button>
      </div>
    );
  }

  const err = state.kind === "error" ? state.fields : {};
  const busy = state.kind === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {state.kind === "error" && <div role="alert" className="border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 font-mono text-xs">{state.message}</div>}

      <div className="flex flex-col gap-2">
        <label htmlFor="c-name" className={label}>Name</label>
        <input id="c-name" name="name" required maxLength={100} autoComplete="name" className={field} aria-invalid={err.name ? true : undefined} aria-describedby={err.name ? "c-name-err" : undefined} />
        {err.name && <p id="c-name-err" className="font-mono text-[11px] text-red-400">{err.name}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="c-email" className={label}>Email</label>
        <input id="c-email" name="email" type="email" required maxLength={254} autoComplete="email" className={field} aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "c-email-err" : undefined} />
        {err.email && <p id="c-email-err" className="font-mono text-[11px] text-red-400">{err.email}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="c-message" className={label}>Message</label>
        <textarea id="c-message" name="message" required rows={6} maxLength={5000} className={field} aria-invalid={err.message ? true : undefined} aria-describedby={err.message ? "c-message-err" : undefined} />
        {err.message && <p id="c-message-err" className="font-mono text-[11px] text-red-400">{err.message}</p>}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <button type="submit" disabled={busy} className="self-start border border-accent text-accent px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-accent/10 disabled:opacity-50 transition-colors">
        {busy ? "Transmitting…" : "Send message"}
      </button>
      <p className="font-mono text-[10px] text-foreground/40 max-w-md">
        Your name and email are used only to reply to this message and are deleted on request.
      </p>
    </form>
  );
}
