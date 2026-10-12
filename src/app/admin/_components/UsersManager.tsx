"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, Wand2 } from "lucide-react";
import { api, ApiError, errorMessage, type PageMeta } from "../_lib/api";
import { Alert, Badge, Button, ConfirmModal, Field, Modal, PageHeader, Pagination, Spinner, inputClass } from "./ui";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  isActive: boolean;
  lastLoginAt: string | null;
}

/** Random passphrase-grade password for convenience; the admin shares it out of band. */
function generatePassword(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "x");
}

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [list, setList] = useState<{ key: string; rows?: UserRow[]; meta?: PageMeta; error?: string }>({ key: "" });
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "editor", password: "" });
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [eraseFor, setEraseFor] = useState<UserRow | null>(null);
  const [eraseError, setEraseError] = useState<string | null>(null);

  const key = `${page}|${reloadToken}`;
  useEffect(() => {
    const ctrl = new AbortController();
    api<UserRow[]>(`/api/admin/users?page=${page}&pageSize=20`, { signal: ctrl.signal })
      .then((r) => setList({ key, rows: r.data, meta: r.meta }))
      .catch((e) => { if ((e as Error).name !== "AbortError") setList({ key, error: errorMessage(e) }); });
    return () => ctrl.abort();
  }, [key, page]);
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const patch = async (u: UserRow, body: Partial<Pick<UserRow, "role" | "isActive">>) => {
    setActionError(null);
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PATCH", json: body });
      setNotice(`Updated ${u.email}.`);
      reload();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const create = async () => {
    setBusy(true);
    setIssues({});
    setFormError(null);
    try {
      await api("/api/admin/users", { json: form });
      setCreating(false);
      setNotice(`Created ${form.email}. Share the password securely; they can change it from Account.`);
      setForm({ email: "", name: "", role: "editor", password: "" });
      reload();
    } catch (e) {
      if (e instanceof ApiError && e.issues.length) {
        const map: Record<string, string> = {};
        for (const i of e.issues) map[i.path] ||= i.message;
        setIssues(map);
        setFormError("Please fix the highlighted fields.");
      } else setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const doReset = async () => {
    if (!resetFor) return;
    setBusy(true);
    setResetError(null);
    try {
      await api(`/api/admin/users/${resetFor.id}/password`, { json: { newPassword: resetPw } });
      setNotice(`Password reset for ${resetFor.email}. Their sessions were signed out.`);
      setResetFor(null);
      setResetPw("");
    } catch (e) {
      setResetError(e instanceof ApiError && e.issues.length ? e.issues.map((i) => i.message).join(". ") : errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const doErase = async () => {
    if (!eraseFor) return;
    setBusy(true);
    setEraseError(null);
    try {
      await api(`/api/admin/users/${eraseFor.id}`, { method: "DELETE" });
      setNotice("User deleted and personal data erased.");
      setEraseFor(null);
      reload();
    } catch (e) {
      setEraseError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Who can sign in to this admin area." actions={<Button onClick={() => { setCreating(true); setFormError(null); setIssues({}); }}><Plus size={13} aria-hidden /> New user</Button>} />
      {notice && <div className="mb-4"><Alert kind="success">{notice}</Alert></div>}
      {actionError && <div className="mb-4"><Alert kind="error">{actionError}</Alert></div>}

      {!list.rows && !list.error ? <Spinner /> : list.error ? <Alert kind="error">{list.error}</Alert> : (
        <div className="overflow-x-auto border border-foreground/10">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-foreground/10 text-[10px] uppercase tracking-widest text-foreground/50">
                {["User", "Role", "Status", "Last sign-in"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-normal">{h}</th>)}
                <th scope="col" className="px-4 py-3 font-normal text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.rows?.map((u) => {
                const me = u.id === currentUserId;
                return (
                  <tr key={u.id} className="border-b border-foreground/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="text-foreground">{u.name} {me && <Badge tone="grey">you</Badge>}</div>
                      <div className="text-foreground/40">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <label className="sr-only" htmlFor={`role-${u.id}`}>Role for {u.email}</label>
                      <select id={`role-${u.id}`} value={u.role} disabled={me} className={`${inputClass} w-auto py-1`}
                        onChange={(e) => void patch(u, { role: e.target.value as "admin" | "editor" })}>
                        <option value="editor" className="bg-surface">Editor</option>
                        <option value="admin" className="bg-surface">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button disabled={me} onClick={() => void patch(u, { isActive: !u.isActive })} className="disabled:cursor-not-allowed"
                        aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.email}`}>
                        <Badge tone={u.isActive ? "green" : "red"}>{u.isActive ? "active" : "disabled"}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground/50">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button aria-label={`Reset password for ${u.email}`} onClick={() => { setResetFor(u); setResetPw(""); setResetError(null); }} className="p-1.5 text-foreground/50 hover:text-accent"><KeyRound size={14} /></button>
                        {!me && <button aria-label={`Delete ${u.email}`} onClick={() => { setEraseFor(u); setEraseError(null); }} className="p-1.5 text-foreground/50 hover:text-red-400"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {list.meta && <Pagination page={list.meta.page} totalPages={list.meta.totalPages} total={list.meta.total} onPage={setPage} />}

      <Modal open={creating} onClose={() => !busy && setCreating(false)} title="New user">
        <form noValidate onSubmit={(e) => { e.preventDefault(); void create(); }} className="flex flex-col gap-5">
          {formError && <Alert kind="error">{formError}</Alert>}
          <Field label="Name" htmlFor="u-name" error={issues.name} required><input id="u-name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email" htmlFor="u-email" error={issues.email} required><input id="u-email" type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Role" htmlFor="u-role" help="Editors write drafts; only admins publish, delete and manage users."><select id="u-role" className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="editor" className="bg-surface">Editor</option><option value="admin" className="bg-surface">Admin</option></select></Field>
          <Field label="Initial password" htmlFor="u-pw" error={issues.password} help="At least 12 characters. Share it securely." required>
            <div className="flex gap-2">
              <input id="u-pw" className={`${inputClass} font-mono`} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Button type="button" variant="ghost" onClick={() => setForm({ ...form, password: generatePassword() })} aria-label="Generate a password"><Wand2 size={13} aria-hidden /></Button>
            </div>
          </Field>
          <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" loading={busy}>Create user</Button></div>
        </form>
      </Modal>

      <Modal open={resetFor !== null} onClose={() => !busy && setResetFor(null)} title="Reset password">
        <form noValidate onSubmit={(e) => { e.preventDefault(); void doReset(); }} className="flex flex-col gap-5">
          <p className="text-sm text-foreground/70">Set a new password for <strong className="text-foreground">{resetFor?.email}</strong>. All of their sessions are signed out.</p>
          {resetError && <Alert kind="error">{resetError}</Alert>}
          <Field label="New password" htmlFor="r-pw" help="At least 12 characters." required>
            <div className="flex gap-2">
              <input id="r-pw" className={`${inputClass} font-mono`} autoComplete="new-password" value={resetPw} onChange={(e) => setResetPw(e.target.value)} />
              <Button type="button" variant="ghost" onClick={() => setResetPw(generatePassword())} aria-label="Generate a password"><Wand2 size={13} aria-hidden /></Button>
            </div>
          </Field>
          <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setResetFor(null)}>Cancel</Button><Button type="submit" loading={busy}>Reset password</Button></div>
        </form>
      </Modal>

      <ConfirmModal open={eraseFor !== null} title="Delete user" confirmLabel="Delete user" busy={busy} error={eraseError} onConfirm={doErase} onClose={() => !busy && setEraseFor(null)}
        message={<>Permanently remove <strong className="text-foreground">{eraseFor?.email}</strong>? Their account is deactivated and their name and email are erased everywhere, including past audit entries.</>} />
    </>
  );
}
