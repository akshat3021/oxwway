"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { api, errorMessage } from "../_lib/api";
import { omitKey } from "../_lib/form";
import { Alert, Button, Field, PageHeader, Spinner, inputClass } from "./ui";

interface Settings {
  showBullWatermark: boolean;
  flags: Record<string, boolean>;
}

export function SettingsForm() {
  const [data, setData] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newFlag, setNewFlag] = useState("");
  const [flagError, setFlagError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    api<Settings>("/api/admin/settings", { signal: ctrl.signal })
      .then((r) => setData({ showBullWatermark: r.data.showBullWatermark, flags: r.data.flags ?? {} }))
      .catch((e) => { if ((e as Error).name !== "AbortError") setLoadError(errorMessage(e)); });
    return () => ctrl.abort();
  }, []);

  const addFlag = () => {
    const name = newFlag.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(name)) {
      setFlagError("Start with a letter; letters, numbers and underscores only (max 40).");
      return;
    }
    setFlagError(undefined);
    setData((d) => (d ? { ...d, flags: { ...d.flags, [name]: false } } : d));
    setNewFlag("");
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setBanner(null);
    try {
      await api("/api/admin/settings", { method: "PUT", json: data });
      setBanner({ kind: "success", text: "Settings saved." });
    } catch (e) {
      setBanner({ kind: "error", text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Site-wide switches. Administrators only." />
      {loadError && <Alert kind="error">{loadError}</Alert>}
      {!data && !loadError && <Spinner />}
      {data && (
        <form className="max-w-2xl flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); void save(); }}>
          {banner && <Alert kind={banner.kind}>{banner.text}</Alert>}

          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input type="checkbox" className="accent-[var(--accent)] w-4 h-4" checked={data.showBullWatermark}
              onChange={(e) => setData({ ...data, showBullWatermark: e.target.checked })} />
            Show the bull-head watermark on the landing page
          </label>

          <fieldset className="border border-foreground/10 p-5">
            <legend className="px-2 text-[10px] uppercase tracking-widest text-foreground/60">Feature flags</legend>
            <p className="text-xs text-foreground/40 mb-4">Named on/off switches for upcoming features. Code reads them with getFlag(&quot;name&quot;).</p>
            {Object.keys(data.flags).length === 0 && <p className="text-xs text-foreground/40 mb-4">No flags defined.</p>}
            <ul className="flex flex-col gap-2 mb-4">
              {Object.entries(data.flags).map(([name, on]) => (
                <li key={name} className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <input type="checkbox" className="accent-[var(--accent)] w-4 h-4" checked={on}
                      onChange={(e) => setData({ ...data, flags: { ...data.flags, [name]: e.target.checked } })} />
                    <code className="font-mono text-xs">{name}</code>
                  </label>
                  <button type="button" aria-label={`Remove flag ${name}`} className="p-1 text-foreground/40 hover:text-red-400"
                    onClick={() => setData({ ...data, flags: omitKey(data.flags, name) })}>
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Field label="New flag name" htmlFor="new-flag" error={flagError}>
                  <input id="new-flag" className={inputClass} value={newFlag} placeholder="newCheckoutFlow"
                    onChange={(e) => setNewFlag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFlag(); } }} />
                </Field>
              </div>
              <Button type="button" variant="ghost" className="mt-6" onClick={addFlag}><Plus size={13} aria-hidden /> Add</Button>
            </div>
          </fieldset>

          <div><Button type="submit" loading={saving}>Save settings</Button></div>
        </form>
      )}
    </>
  );
}
