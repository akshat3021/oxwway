"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { api, errorMessage, type PageMeta } from "../_lib/api";
import { Alert, Badge, Button, ConfirmModal, EmptyState, PageHeader, Pagination, Spinner, inputClass } from "./ui";

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export function MessagesManager() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [list, setList] = useState<{ key: string; rows?: Message[]; meta?: PageMeta; error?: string }>({ key: "" });
  const [openId, setOpenId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);

  const key = `${page}|${filter}|${reloadToken}`;
  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: "15" });
    if (filter) params.set("status", filter);
    api<Message[]>(`/api/admin/messages?${params}`, { signal: ctrl.signal })
      .then((r) => setList({ key, rows: r.data, meta: r.meta }))
      .catch((e) => { if ((e as Error).name !== "AbortError") setList({ key, error: errorMessage(e) }); });
    return () => ctrl.abort();
  }, [key, page, filter]);
  const loading = list.key !== key;
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  const setRead = async (m: Message, read: boolean) => {
    setActionError(null);
    try { await api(`/api/admin/messages/${m.id}`, { method: "PATCH", json: { read } }); reload(); }
    catch (e) { setActionError(errorMessage(e)); }
  };

  const toggle = (m: Message) => {
    const opening = openId !== m.id;
    setOpenId(opening ? m.id : null);
    if (opening && !m.readAt) void setRead(m, true);
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try { await api(`/api/admin/messages/${deleting.id}`, { method: "DELETE" }); setDeleting(null); reload(); }
    catch (e) { setActionError(errorMessage(e)); setDeleting(null); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Messages" subtitle="Submissions from the website contact form. Contains personal data; delete when no longer needed." />
      <div className="mb-4">
        <label htmlFor="m-filter" className="sr-only">Filter messages</label>
        <select id="m-filter" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className={`${inputClass} w-auto`}>
          <option value="" className="bg-surface">All</option>
          <option value="unread" className="bg-surface">Unread</option>
          <option value="read" className="bg-surface">Read</option>
        </select>
      </div>
      {actionError && <div className="mb-4"><Alert kind="error">{actionError}</Alert></div>}

      {!list.rows && !list.error ? <Spinner /> : list.error ? <Alert kind="error">{list.error}</Alert> : list.rows?.length === 0 ? (
        <EmptyState title="No messages." hint="New contact-form submissions appear here." />
      ) : (
        <ul className={`border border-foreground/10 divide-y divide-foreground/5 transition-opacity ${loading ? "opacity-50" : ""}`}>
          {list.rows?.map((m) => (
            <li key={m.id}>
              <button onClick={() => toggle(m)} aria-expanded={openId === m.id} className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-foreground/[0.03]">
                {m.readAt ? <MailOpen size={14} className="text-foreground/30" aria-hidden /> : <Mail size={14} className="text-accent" aria-hidden />}
                <span className={`flex-1 truncate ${m.readAt ? "text-foreground/60" : "text-foreground"}`}>{m.name} <span className="text-foreground/40">· {m.email}</span></span>
                {!m.readAt && <Badge tone="amber">new</Badge>}
                <span className="text-[11px] text-foreground/40 tabular-nums">{new Date(m.createdAt).toLocaleString()}</span>
              </button>
              {openId === m.id && (
                <div className="px-4 pb-4 pl-12">
                  {/* Rendered as plain text: React escapes it, so submitted markup can never execute. */}
                  <p className="whitespace-pre-wrap break-words text-sm text-foreground/80 mb-4">{m.message}</p>
                  <div className="flex gap-3">
                    <a href={`mailto:${m.email}`} className="inline-flex items-center px-4 py-2 text-xs uppercase tracking-widest border border-foreground/20 hover:border-accent hover:text-accent">Reply</a>
                    <Button variant="ghost" onClick={() => void setRead(m, !m.readAt)}>{m.readAt ? "Mark unread" : "Mark read"}</Button>
                    <Button variant="danger" onClick={() => setDeleting(m)}><Trash2 size={13} aria-hidden /> Delete</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {list.meta && <Pagination page={list.meta.page} totalPages={list.meta.totalPages} total={list.meta.total} onPage={setPage} />}

      <ConfirmModal open={deleting !== null} title="Delete message" confirmLabel="Delete permanently" busy={busy} onConfirm={remove} onClose={() => !busy && setDeleting(null)}
        message={<>This permanently erases the message from <strong className="text-foreground">{deleting?.name}</strong>. It cannot be recovered.</>} />
    </>
  );
}
