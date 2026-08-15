"use client";

import { Search, Plus, Calendar, Pencil, Trash2, CreditCard, PaperclipIcon, BookOpenText } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DateRangeFilter } from "@/components/date-range-filter";
import { EntryDialog } from "@/components/entry-dialog";
import { PaymentDialog } from "@/components/payment-dialog";
import { useAppData } from "@/components/providers/app-provider";
import { AppButton, StatusBadge } from "@/components/ui";
import { filterEntries, formatCurrency, formatDate, getEntrySummary } from "@/lib/finance";
import { DateRange, JournalEntry } from "@/lib/types";

const rangeDefaults: DateRange = { preset: "all-time" };

/* ─── Entry Card ────────────────────────────────────────────────────── */
function EntryCard({
  entry,
  active,
  accounts,
  onClick,
}: {
  entry: JournalEntry;
  active: boolean;
  accounts: { id: string; name: string }[];
  onClick: () => void;
}) {
  const summary = getEntrySummary(entry);
  const statusTone = summary.paymentStatus === "Paid" ? "success" : summary.paymentStatus === "Pending" ? "muted" : "warning";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "focus-ring w-full rounded-[var(--radius-lg)] p-5 text-left transition-all duration-200",
        active
          ? "bg-[var(--accent-dim)] ring-1 ring-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]"
          : "glass hover:bg-[var(--bg-card-hover)] hover:-translate-y-px",
      ].join(" ")}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          {formatDate(entry.date)}
        </div>
        <StatusBadge tone={statusTone}>{summary.paymentStatus}</StatusBadge>
      </div>

      {/* Bill name */}
      <h3 className="font-display mt-3 text-2xl font-bold leading-tight text-[var(--text-primary)]">
        {entry.particular}
      </h3>

      {/* Item pills */}
      {entry.items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.items.slice(0, 4).map((item) => {
            const acc = accounts.find((a) => a.id === item.itemAccountId);
            return (
              <span
                key={item.id}
                className="rounded-full bg-[var(--bg-card)] px-2.5 py-0.5 text-[11px] text-[var(--text-muted)] ring-1 ring-[var(--border)]"
              >
                {acc?.name ?? "—"}
              </span>
            );
          })}
          {entry.items.length > 4 && (
            <span className="rounded-full bg-[var(--bg-card)] px-2.5 py-0.5 text-[11px] text-[var(--text-faint)] ring-1 ring-[var(--border)]">
              +{entry.items.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Amount row */}
      <div className="mt-4 flex items-end justify-between">
        <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 text-xs">
          <span className="text-[var(--text-faint)]">Paid</span>
          <span className="text-[var(--text-faint)]">Due</span>
          <span className="font-semibold text-[var(--success)]">{formatCurrency(summary.paidPaise)}</span>
          <span className={summary.outstandingPaise > 0 ? "font-semibold text-[var(--warning)]" : "font-semibold text-[var(--text-muted)]"}>
            {formatCurrency(summary.outstandingPaise)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-faint)]">Total</p>
          <p className="font-display text-xl font-bold text-[var(--text-primary)]">
            {formatCurrency(summary.totalPaise)}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ─── Entry Detail Panel ────────────────────────────────────────────── */
function EntryDetail({
  entry,
  accounts,
  onEdit,
  onAddPayment,
  onDelete,
}: {
  entry: JournalEntry;
  accounts: { id: string; name: string }[];
  onEdit: () => void;
  onAddPayment: () => void;
  onDelete: () => void;
}) {
  const summary = getEntrySummary(entry);
  const chipColors = [
    "rgba(99,102,241,0.12)",
    "rgba(16,185,129,0.12)",
    "rgba(245,158,11,0.12)",
    "rgba(244,63,94,0.12)",
    "rgba(139,92,246,0.12)",
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div
        className="rounded-[var(--radius-lg)] p-5"
        style={{
          background: "linear-gradient(135deg, var(--accent-dim), rgba(99,102,241,0.05))",
          border: "1px solid var(--border-accent)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Entry Detail</p>
        <h3 className="font-display mt-2 text-3xl font-bold leading-tight text-[var(--text-primary)]">
          {entry.particular}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          {formatDate(entry.date)}
        </p>

        {/* Summary totals */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Total",       value: summary.totalPaise,       color: "var(--text-primary)" },
            { label: "Paid",        value: summary.paidPaise,        color: "var(--success)" },
            { label: "Outstanding", value: summary.outstandingPaise, color: summary.outstandingPaise > 0 ? "var(--warning)" : "var(--text-muted)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[var(--radius-sm)] bg-[var(--bg-card)] p-3">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-faint)]">{label}</p>
              <p className="font-display mt-1 text-lg font-bold" style={{ color }}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-[var(--radius-lg)] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Bill items · {entry.items.length}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {entry.items.map((item, i) => {
            const acc = accounts.find((a) => a.id === item.itemAccountId);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] px-4 py-3"
                style={{ background: chipColors[i % chipColors.length], border: "1px solid var(--border)" }}
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{acc?.name ?? "Unknown"}</p>
                  {(item.quantity || item.unit) && (
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.quantity ? `Qty ${item.quantity}` : ""}
                      {item.unit ? ` ${item.unit}` : ""}
                    </p>
                  )}
                </div>
                <p className="font-display text-base font-bold text-[var(--text-primary)]">
                  {formatCurrency(item.amountPaise)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payments */}
      <div className="glass rounded-[var(--radius-lg)] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Payment history
        </p>
        {entry.payments.length ? (
          <div className="mt-3 flex flex-col gap-2">
            {entry.payments.map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--success-dim)] px-4 py-3 ring-1 ring-[var(--success)]/20"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{formatDate(pay.date)}</p>
                  {pay.note && <p className="text-xs text-[var(--text-muted)]">{pay.note}</p>}
                </div>
                <p className="font-display text-base font-bold text-[var(--success)]">
                  {formatCurrency(pay.amountPaise)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-faint)]">No payments recorded yet.</p>
        )}
      </div>

      {/* Bill photo */}
      {entry.attachments.length > 0 && (
        <div className="glass rounded-[var(--radius-lg)] p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <PaperclipIcon className="h-3.5 w-3.5" aria-hidden />
            Bill photo
          </p>
          <div className="overflow-hidden rounded-[var(--radius)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.attachments[0].dataUrl}
              alt={entry.attachments[0].fileName}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div className="rounded-[var(--radius-lg)] bg-[var(--bg-card)] p-4 ring-1 ring-[var(--border)]">
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{entry.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <AppButton tone="secondary" onClick={onEdit}>
          <Pencil className="h-4 w-4" aria-hidden />
          Edit
        </AppButton>
        <AppButton tone="secondary" onClick={onAddPayment}>
          <CreditCard className="h-4 w-4" aria-hidden />
          Pay
        </AppButton>
        <AppButton tone="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete
        </AppButton>
      </div>
    </div>
  );
}

/* ─── Journal View ──────────────────────────────────────────────────── */
export function JournalView() {
  const { data, deleteEntry } = useAppData();
  const [range, setRange] = useState<DateRange>(rangeDefaults);
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>();
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [paymentEntryId, setPaymentEntryId] = useState<string | null>(null);

  const entries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filterEntries(data.journalEntries, range)
      .filter((e) => {
        if (!q) return true;
        const names = e.items
          .map((i) => data.itemAccounts.find((a) => a.id === i.itemAccountId)?.name ?? "")
          .join(" ")
          .toLowerCase();
        return (
          e.particular.toLowerCase().includes(q) ||
          names.includes(q) ||
          `${getEntrySummary(e).totalPaise / 100}`.includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.journalEntries, data.itemAccounts, range, search]);

  return (
    <AppShell
      title="Journal"
      description="Your construction expense journal. Every entry auto-feeds the ledgers, analytics, and outstanding dues."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <DateRangeFilter value={range} onChange={setRange} />
          <AppButton
            onClick={() => {
              setSelectedEntry(undefined);
              setEntryDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            New entry
          </AppButton>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        {/* ── Left: Entry List ───────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="glass relative rounded-[var(--radius-lg)] px-4 py-3">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]"
              aria-hidden
            />
            <input
              className="w-full bg-transparent pl-7 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none"
              placeholder="Search bill name, material, amount…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search journal entries"
            />
          </div>

          {/* Counter */}
          {entries.length > 0 && (
            <p className="px-1 text-xs text-[var(--text-faint)]">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          )}

          {/* Entry cards */}
          {entries.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center rounded-[var(--radius-xl)] py-16 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "var(--accent-dim)", border: "1px solid var(--border-accent)" }}
              >
                <BookOpenText className="h-7 w-7 text-[var(--accent)]" aria-hidden />
              </div>
              <p className="mt-4 text-base font-semibold text-[var(--text-secondary)]">No entries yet</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Tap "+ New entry" to add your first bill.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  active={selectedEntry?.id === entry.id}
                  accounts={data.itemAccounts}
                  onClick={() => setSelectedEntry((prev) => (prev?.id === entry.id ? undefined : entry))}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Detail Panel ────────────────────────────────── */}
        <div className="hidden xl:block">
          <div className="sticky top-4">
            {selectedEntry ? (
              <EntryDetail
                entry={selectedEntry}
                accounts={data.itemAccounts}
                onEdit={() => setEntryDialogOpen(true)}
                onAddPayment={() => setPaymentEntryId(selectedEntry.id)}
                onDelete={() => {
                  deleteEntry(selectedEntry.id);
                  setSelectedEntry(undefined);
                }}
              />
            ) : (
              <div className="glass flex min-h-[360px] flex-col items-center justify-center rounded-[var(--radius-xl)] p-8 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "var(--accent-dim)", border: "1px solid var(--border-accent)" }}
                >
                  <BookOpenText className="h-6 w-6 text-[var(--accent)]" aria-hidden />
                </div>
                <p className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">Select an entry</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Tap any bill card to view items, payments, and actions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile expanded detail (below cards on mobile) */}
      {selectedEntry && (
        <div className="mt-4 xl:hidden">
          <EntryDetail
            entry={selectedEntry}
            accounts={data.itemAccounts}
            onEdit={() => setEntryDialogOpen(true)}
            onAddPayment={() => setPaymentEntryId(selectedEntry.id)}
            onDelete={() => {
              deleteEntry(selectedEntry.id);
              setSelectedEntry(undefined);
            }}
          />
        </div>
      )}

      <EntryDialog
        entry={selectedEntry}
        open={entryDialogOpen}
        onClose={() => setEntryDialogOpen(false)}
      />
      <PaymentDialog
        entryId={paymentEntryId ?? ""}
        open={Boolean(paymentEntryId)}
        onClose={() => setPaymentEntryId(null)}
      />
    </AppShell>
  );
}
