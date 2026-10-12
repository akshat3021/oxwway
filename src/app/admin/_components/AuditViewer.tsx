"use client";

import { useEffect, useState } from "react";
import { api, errorMessage, type PageMeta } from "../_lib/api";
import { Alert, EmptyState, PageHeader, Pagination, Spinner, inputClass } from "./ui";

interface Entry {
  id: number;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  createdAt: string;
}

const ENTITIES = ["", "BlogPost", "Product", "TeamMember", "JobListing", "GalleryItem", "HomepageContent", "CompanyInfo", "SiteSettings", "User", "Session", "ContactMessage"];

export function AuditViewer() {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [actor, setActor] = useState("");
  const [debouncedActor, setDebouncedActor] = useState("");
  const [list, setList] = useState<{ key: string; rows?: Entry[]; meta?: PageMeta; error?: string }>({ key: "" });

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedActor(actor); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [actor]);

  const key = `${page}|${entity}|${debouncedActor}`;
  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (entity) params.set("entity", entity);
    if (debouncedActor) params.set("q", debouncedActor);
    api<Entry[]>(`/api/admin/audit?${params}`, { signal: ctrl.signal })
      .then((r) => setList({ key, rows: r.data, meta: r.meta }))
      .catch((e) => { if ((e as Error).name !== "AbortError") setList({ key, error: errorMessage(e) }); });
    return () => ctrl.abort();
  }, [key, page, entity, debouncedActor]);
  const loading = list.key !== key;

  return (
    <>
      <PageHeader title="Audit log" subtitle="Append-only record of sign-ins and every change. Stores which fields changed, never their contents." />
      <div className="flex flex-wrap gap-3 mb-4">
        <label className="sr-only" htmlFor="a-entity">Filter by type</label>
        <select id="a-entity" value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }} className={`${inputClass} w-auto`}>
          {ENTITIES.map((e) => <option key={e} value={e} className="bg-surface">{e || "All types"}</option>)}
        </select>
        <label className="sr-only" htmlFor="a-actor">Filter by user email</label>
        <input id="a-actor" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Filter by user email…" className={`${inputClass} max-w-xs`} />
      </div>

      {!list.rows && !list.error ? <Spinner /> : list.error ? <Alert kind="error">{list.error}</Alert> : list.rows?.length === 0 ? <EmptyState title="No matching activity." /> : (
        <div className={`overflow-x-auto border border-foreground/10 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-foreground/10 text-[10px] uppercase tracking-widest text-foreground/50">
                {["When", "Who", "Action", "Target", "IP"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-normal">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.rows?.map((r) => (
                <tr key={r.id} className="border-b border-foreground/5 last:border-0">
                  <td className="px-4 py-2.5 tabular-nums text-foreground/50 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2.5">{r.actorEmail}</td>
                  <td className="px-4 py-2.5 font-mono text-accent">{r.action}</td>
                  <td className="px-4 py-2.5">{r.entity}{r.entityId ? <span className="text-foreground/40"> #{r.entityId.slice(0, 8)}</span> : null}</td>
                  <td className="px-4 py-2.5 text-foreground/40">{r.ip ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {list.meta && <Pagination page={list.meta.page} totalPages={list.meta.totalPages} total={list.meta.total} onPage={setPage} />}
    </>
  );
}
