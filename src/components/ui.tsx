"use client";

import clsx from "clsx";
import { ReactNode } from "react";

/* ─── Button ────────────────────────────────────────────────────────── */
export function AppButton({
  children,
  className,
  tone = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius)] px-5 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.97]",
        tone === "primary" &&
          "bg-[var(--accent)] text-white glow-btn hover:bg-[var(--accent-hover)]",
        tone === "secondary" &&
          "border border-[var(--border-strong)] bg-[var(--bg-card-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-px",
        tone === "ghost" &&
          "border border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-secondary)]",
        tone === "danger" &&
          "border border-[var(--danger)] bg-[var(--danger-dim)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ─── Field ─────────────────────────────────────────────────────────── */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold tracking-wide text-[var(--text-secondary)]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
      {error && (
        <span className="flex items-center gap-1 text-xs text-[var(--danger)]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <circle cx="6" cy="6" r="5.5" fill="none" stroke="currentColor"/>
            <path d="M6 3.5v3M6 8.5v.5"/>
          </svg>
          {error}
        </span>
      )}
    </label>
  );
}

/* ─── Text Input ─────────────────────────────────────────────────────── */
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "focus-ring min-h-[44px] w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
        "transition duration-150 hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:bg-[var(--bg-card)]",
        props.className,
      )}
    />
  );
}

/* ─── Text Area ──────────────────────────────────────────────────────── */
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "focus-ring min-h-[88px] w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card-muted)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
        "transition duration-150 hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:bg-[var(--bg-card)]",
        props.className,
      )}
    />
  );
}

/* ─── Select Input ───────────────────────────────────────────────────── */
export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "focus-ring min-h-[44px] w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)]",
        "transition duration-150 hover:border-[var(--border-strong)] focus:border-[var(--accent)]",
        props.className,
      )}
    />
  );
}

/* ─── Surface / Card ─────────────────────────────────────────────────── */
export function Surface({
  children,
  className,
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section
      className={clsx(
        "rounded-[var(--radius-lg)]",
        muted ? "panel-soft" : "glass",
        className,
      )}
    >
      {children}
    </section>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────── */
export function StatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "warning" | "muted";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tone === "success" &&
          "bg-[var(--success-dim)] text-[var(--success)] ring-1 ring-[var(--success)]/30",
        tone === "warning" &&
          "bg-[var(--warning-dim)] text-[var(--warning)] ring-1 ring-[var(--warning)]/30",
        tone === "muted" &&
          "bg-[var(--bg-card)] text-[var(--text-muted)] ring-1 ring-[var(--border-strong)]",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          tone === "success" && "bg-[var(--success)]",
          tone === "warning" && "bg-[var(--warning)]",
          tone === "muted"   && "bg-[var(--text-muted)]",
        )}
      />
      {children}
    </span>
  );
}

/* ─── Toggle Switch ──────────────────────────────────────────────────── */
export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="glass flex items-center justify-between gap-4 rounded-[var(--radius)] p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx(
          "focus-ring relative h-7 w-12 rounded-full border transition duration-200",
          checked
            ? "border-[var(--accent)] bg-[var(--accent)]"
            : "border-[var(--border-strong)] bg-[var(--bg-card)]",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
