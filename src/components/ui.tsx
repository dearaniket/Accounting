"use client";

import clsx from "clsx";
import { ReactNode } from "react";

export function AppButton({
  children,
  className,
  tone = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-11 items-center justify-center rounded-[18px] border-2 px-5 py-2.5 text-sm font-semibold transition duration-200",
        tone === "primary" &&
          "border-[var(--border-subtle)] bg-[var(--surface-chip-yellow)] text-[var(--text-strong)] hover:-translate-y-0.5",
        tone === "secondary" &&
          "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:bg-[var(--surface-card-soft)]",
        tone === "ghost" && "border-transparent bg-transparent text-[var(--text-body)] hover:bg-[rgba(255,255,255,0.35)]",
        tone === "danger" && "border-[var(--border-subtle)] bg-[var(--color-danger)] text-[var(--text-strong)] hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

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
    <label className="flex flex-col gap-2 text-sm text-[var(--text-body)]">
      <span className="font-medium tracking-[0.01em] text-[var(--text-strong)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--text-muted)]">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "focus-ring min-h-11 rounded-[18px] border-2 border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)]",
        "bg-[var(--surface-card)]",
        props.className,
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "focus-ring min-h-28 rounded-[18px] border-2 border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)]",
        "bg-[var(--surface-card)]",
        props.className,
      )}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "focus-ring min-h-11 rounded-[18px] border-2 border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-strong)]",
        "bg-[var(--surface-card)]",
        props.className,
      )}
    />
  );
}

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
    <section className={clsx(muted ? "panel-soft" : "panel", "rounded-[var(--radius-card)]", className)}>{children}</section>
  );
}

export function StatusBadge({ children, tone }: { children: ReactNode; tone: "success" | "warning" | "muted" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "success" && "border border-[var(--border-subtle)] bg-[var(--surface-chip-mint)] text-[var(--text-strong)]",
        tone === "warning" && "border border-[var(--border-subtle)] bg-[var(--surface-chip-yellow)] text-[var(--text-strong)]",
        tone === "muted" && "border border-[var(--border-subtle)] bg-[var(--surface-chip-lilac)] text-[var(--text-strong)]",
      )}
    >
      {children}
    </span>
  );
}

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
    <div className="flex items-center justify-between gap-4 rounded-[22px] border-2 border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--text-strong)]">{label}</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`focus-ring relative h-9 w-16 rounded-full border-2 border-[var(--border-subtle)] transition duration-200 ${
          checked ? "bg-[var(--surface-chip-mint)]" : "bg-[var(--surface-chip-lilac)]"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full border-2 border-[var(--border-subtle)] bg-[var(--surface-card)] transition duration-200 ${
            checked ? "left-9" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
