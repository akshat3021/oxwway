"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, ApiError, errorMessage, type PageMeta } from "../_lib/api";
import { FormParseError, initialState, omitKey, slugify, toPayload, type FormState } from "../_lib/form";
import { RESOURCES, type ColumnDef } from "../_lib/resources";
import { FormFields } from "./FormFields";
import { Alert, Badge, Button, ConfirmModal, EmptyState, Modal, PageHeader, Pagination, Spinner, inputClass } from "./ui";

type Row = Record<string, unknown> & { id: number };
interface ListState {
  key: string;
  rows?: Row[];
  meta?: PageMeta;
  error?: string;
}

function renderCell(col: ColumnDef, value: unknown) {
  if (value === null || value === undefined || value === "") return <span className="text-foreground/25">–</span>;
  if (col.kind === "status") {
    const v = String(value);
    return <Badge tone={v === "published" || v === "open" ? "green" : v === "draft" ? "amber" : "grey"}>{v}</Badge>;
  }
  if (col.kind === "date") return new Date(String(value)).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const text = String(value);
  return <span className="block max-w-[28ch] truncate" title={text}>{text}</span>;
}

export function ResourceManager({ configKey, role }: { configKey: string; role: "admin" | "editor" }) {
  const cfg = RESOURCES[configKey];
  const isAdmin = role === "admin";

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [list, setList] = useState<ListState>({ key: "" });
  const [notice, setNotice] = useState<string | null>(null);

  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [deleting, setDeleting] = useState<Row | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const key = `${page}|${debouncedQ}|${status}|${reloadToken}`;
  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: "15" });
    if (debouncedQ) params.set("q", debouncedQ);
    if (status) params.set("status", status);
    api<Row[]>(`/api/admin/${cfg.resource}?${params}`, { signal: ctrl.signal })
      .then((r) => setList({ key, rows: r.data, meta: r.meta }))
      .catch((e) => { if ((e as Error).name !== "AbortError") setList({ key, error: errorMessage(e) }); });
    return () => ctrl.abort();
  }, [key, cfg.resource, page, debouncedQ, status]);
  const loading = list.key !== key;
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  const openForm = (row: Row | "new") => {
    setEditing(row);
    setForm(initialState(cfg.fields, row === "new" ? null : row));
    setErrors({});
    setFormError(null);
    setSlugTouched(row !== "new");
  };

  const change = (name: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      const slugField = cfg.fields.find((f) => f.type === "slug");
      if (slugField && !slugTouched) {
        if (name === slugField.deriveFrom) next[slugField.name] = slugify(value);
      }
      return next;
    });
    if (cfg.fields.find((f) => f.name === name)?.type === "slug") setSlugTouched(true);
    setErrors((prev) => (prev[name] ? omitKey(prev, name) : prev));
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    setErrors({});
    try {
      const payload = toPayload(cfg.fields, form);
      if (editing === "new") await api(`/api/admin/${cfg.resource}`, { json: payload });
      else if (editing) await api(`/api/admin/${cfg.resource}/${editing.id}`, { method: "PATCH", json: payload });
      setNotice(editing === "new" ? `${cap(cfg.singular)} created.` : `${cap(cfg.singular)} saved.`);
      setEditing(null);
      reload();
    } catch (e) {
      if (e instanceof FormParseError) setErrors({ [e.field]: e.message });
      else if (e instanceof ApiError && e.issues.length) {
        const map: Record<string, string> = {};
        for (const i of e.issues) map[i.path.split(".")[0]] ||= i.message;
        setErrors(map);
        setFormError("Please fix the highlighted fields.");
      } else setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api(`/api/admin/${cfg.resource}/${deleting.id}`, { method: "DELETE" });
      setNotice(`${cap(cfg.singular)} deleted.`);
      setDeleting(null);
      if (list.rows?.length === 1 && page > 1) setPage(page - 1);
      reload();
    } catch (e) {
      setDeleteError(errorMessage(e));
    } finally {
      setDeleteBusy(false);
    }
  };

  const locked = useMemo(() => {
    if (isAdmin) return undefined;
    const l: Record<string, string> = {};
    for (const f of cfg.fields) if (f.publishState) l[f.name] = "Only administrators can change publish state.";
    return l;
  }, [cfg.fields, isAdmin]);

  const titleOf = (r: Row) => String(r[cfg.titleField] || `#${r.id}`);

  return (
    <>
      <PageHeader
        title={cfg.plural}
        actions={<Button onClick={() => openForm("new")}><Plus size={13} aria-hidden /> New {cfg.singular}</Button>}
      />

      {notice && <div className="mb-4"><Alert kind="success">{notice}</Alert></div>}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" aria-hidden />
          <label htmlFor="search" className="sr-only">Search {cfg.plural}</label>
          <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={`${inputClass} pl-9`} />
        </div>
        {cfg.statusOptions && (
          <>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select id="status-filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={`${inputClass} w-auto`}>
              <option value="" className="bg-surface">All statuses</option>
              {cfg.statusOptions.map((o) => <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>)}
            </select>
          </>
        )}
      </div>

      {loading && !list.rows ? (
        <Spinner />
      ) : list.error ? (
        <Alert kind="error">
          {list.error} <button className="underline ml-2" onClick={reload}>Retry</button>
        </Alert>
      ) : list.rows && list.rows.length === 0 ? (
        <EmptyState
          title={debouncedQ || status ? "Nothing matches your filters." : `No ${cfg.plural.toLowerCase()} yet.`}
          hint={debouncedQ || status ? undefined : `Create the first ${cfg.singular} to get started.`}
          action={!debouncedQ && !status ? <Button onClick={() => openForm("new")}><Plus size={13} aria-hidden /> New {cfg.singular}</Button> : undefined}
        />
      ) : (
        <div className={`overflow-x-auto border border-foreground/10 transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-foreground/10 text-[10px] uppercase tracking-widest text-foreground/50">
                {cfg.columns.map((c) => <th key={c.key} scope="col" className="px-4 py-3 font-normal">{c.label}</th>)}
                <th scope="col" className="px-4 py-3 font-normal text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.rows?.map((row) => (
                <tr key={row.id} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.03]">
                  {cfg.columns.map((c) => <td key={c.key} className="px-4 py-3">{renderCell(c, row[c.key])}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openForm(row)} aria-label={`Edit ${titleOf(row)}`} className="p-1.5 text-foreground/50 hover:text-accent focus-visible:outline focus-visible:outline-accent"><Pencil size={14} /></button>
                      {isAdmin && (
                        <button onClick={() => { setDeleting(row); setDeleteError(null); }} aria-label={`Delete ${titleOf(row)}`} className="p-1.5 text-foreground/50 hover:text-red-400 focus-visible:outline focus-visible:outline-red-400"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.meta && <Pagination page={list.meta.page} totalPages={list.meta.totalPages} total={list.meta.total} onPage={setPage} />}

      <Modal open={editing !== null} onClose={() => !saving && setEditing(null)} title={editing === "new" ? `New ${cfg.singular}` : `Edit ${cfg.singular}`} wide>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} noValidate>
          {formError && <div className="mb-5"><Alert kind="error">{formError}</Alert></div>}
          <FormFields fields={cfg.fields} state={form} errors={errors} onChange={change} idPrefix="f" disabled={saving} lockedFields={locked} />
          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={deleting !== null}
        title={`Delete ${cfg.singular}`}
        message={<>Delete <strong className="text-foreground">{deleting ? titleOf(deleting) : ""}</strong>? It will be removed from the website. This action is recorded in the audit log.</>}
        confirmLabel="Delete"
        busy={deleteBusy}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => !deleteBusy && setDeleting(null)}
      />
    </>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
