"use client";

import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export const inputClass =
  "w-full bg-transparent border border-foreground/15 px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 " +
  "focus:outline-none focus:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50 aria-[invalid=true]:border-red-500";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-2">[ SYS.ADMIN ]</div>
        <h1 className="text-2xl font-display uppercase tracking-wide text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-foreground/50 mt-1 max-w-xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

type Variant = "primary" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:opacity-90 border border-accent",
  ghost: "border border-foreground/20 text-foreground/80 hover:border-foreground/50 hover:text-foreground",
  danger: "border border-red-500/50 text-red-400 hover:bg-red-500/10",
};

export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 size={13} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  help,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[10px] uppercase tracking-widest text-foreground/60">
        {label}
        {required && <span className="text-accent" aria-hidden> *</span>}
      </label>
      {children}
      {help && !error && <p id={`${htmlFor}-help`} className="text-[11px] text-foreground/40">{help}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-red-500/40 bg-red-500/10 text-red-300",
    success: "border-green-500/40 bg-green-500/10 text-green-300",
    info: "border-foreground/20 bg-foreground/5 text-foreground/70",
  }[kind];
  const Icon = kind === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-2 border px-3 py-2 text-xs ${styles}`}>
      <Icon size={14} className="mt-0.5 flex-shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 text-xs text-foreground/50 py-10 justify-center">
      <Loader2 size={14} className="animate-spin" aria-hidden /> {label}…
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-foreground/15 py-14 text-center">
      <p className="text-sm text-foreground/70">{title}</p>
      {hint && <p className="text-xs text-foreground/40 mt-1">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "amber" | "grey" | "red"; children: ReactNode }) {
  const t = {
    green: "text-green-400 border-green-500/40",
    amber: "text-amber-400 border-amber-500/40",
    grey: "text-foreground/50 border-foreground/20",
    red: "text-red-400 border-red-500/40",
  }[tone];
  return <span className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-widest ${t}`}>{children}</span>;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between mt-4 text-xs text-foreground/50">
      <span>{total} total</span>
      <div className="flex items-center gap-3">
        <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">Prev</Button>
        <span aria-live="polite">Page {page} of {totalPages}</span>
        <Button variant="ghost" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page">Next</Button>
      </div>
    </nav>
  );
}

/**
 * Accessible modal built on the native <dialog>: focus is trapped, Esc closes,
 * and focus returns to the opener: all provided by the browser.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={`m-auto bg-surface text-foreground border border-foreground/15 p-0 backdrop:bg-black/70 w-[calc(100vw-2rem)] ${wide ? "max-w-3xl" : "max-w-md"} max-h-[90vh]`}
    >
      {open && (
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <h2 id={titleId} className="text-sm uppercase tracking-widest mb-5">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-sm text-foreground/70 mb-5">{message}</div>
      {error && <div className="mb-4"><Alert kind="error">{error}</Alert></div>}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" loading={busy} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
