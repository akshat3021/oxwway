"use client";

import { useEffect, useState } from "react";
import { api, ApiError, errorMessage } from "../_lib/api";
import { initialState, omitKey, toPayload, type FormState } from "../_lib/form";
import { SINGLETONS } from "../_lib/resources";
import { FormFields } from "./FormFields";
import { Alert, Button, PageHeader, Spinner } from "./ui";

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready" };

export function SingletonForm({ configKey }: { configKey: string }) {
  const cfg = SINGLETONS[configKey];
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    api<Record<string, unknown>>(cfg.endpoint, { signal: ctrl.signal })
      .then((r) => { setForm(initialState(cfg.fields, r.data)); setLoad({ state: "ready" }); })
      .catch((e) => { if ((e as Error).name !== "AbortError") setLoad({ state: "error", message: errorMessage(e) }); });
    return () => ctrl.abort();
  }, [cfg]);

  const save = async () => {
    setSaving(true);
    setBanner(null);
    setErrors({});
    try {
      await api(cfg.endpoint, { method: "PUT", json: toPayload(cfg.fields, form) });
      setBanner({ kind: "success", text: "Saved. The website is updated." });
    } catch (e) {
      if (e instanceof ApiError && e.issues.length) {
        const map: Record<string, string> = {};
        for (const i of e.issues) map[i.path.split(".")[0]] ||= i.message;
        setErrors(map);
        setBanner({ kind: "error", text: "Please fix the highlighted fields." });
      } else setBanner({ kind: "error", text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={cfg.title} subtitle={cfg.description} />
      {load.state === "loading" && <Spinner />}
      {load.state === "error" && <Alert kind="error">{load.message}</Alert>}
      {load.state === "ready" && (
        <form className="max-w-2xl" noValidate onSubmit={(e) => { e.preventDefault(); void save(); }}>
          {banner && <div className="mb-5"><Alert kind={banner.kind}>{banner.text}</Alert></div>}
          <FormFields fields={cfg.fields} state={form} errors={errors} idPrefix="s" disabled={saving}
            onChange={(n, v) => { setForm((p) => ({ ...p, [n]: v })); setErrors((p) => omitKey(p, n)); }} />
          <div className="mt-8"><Button type="submit" loading={saving}>Save changes</Button></div>
        </form>
      )}
    </>
  );
}
