"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DateRangeFilter } from "@/components/date-range-filter";
import { EntryDialog } from "@/components/entry-dialog";
import { PaymentDialog } from "@/components/payment-dialog";
import { useAppData } from "@/components/providers/app-provider";
import { AppButton, StatusBadge, Surface, TextInput } from "@/components/ui";
import { filterEntries, formatCurrency, formatDate, getEntrySummary } from "@/lib/finance";
import { DateRange, JournalEntry } from "@/lib/types";

const rangeDefaults: DateRange = { preset: "all-time" };

export function JournalView() {
  const { data, deleteEntry } = useAppData();
  const [range, setRange] = useState<DateRange>(rangeDefaults);
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>();
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [paymentEntryId, setPaymentEntryId] = useState<string | null>(null);
  const entries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return filterEntries(data.journalEntries, range)
      .filter((entry) => {
        const summary = getEntrySummary(entry);
        const accountNames = entry.items
          .map((item) => data.itemAccounts.find((account) => account.id === item.itemAccountId)?.name ?? "")
          .join(" ")
          .toLowerCase();

        return (
          !query ||
          entry.particular.toLowerCase().includes(query) ||
          accountNames.includes(query) ||
          `${summary.totalPaise / 100}`.includes(query)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.itemAccounts, data.journalEntries, range, search]);

  return (
    <AppShell
      title="Journal"
      description="Use the journal as the source of truth. Every item feeds its ledger automatically, and payment history stays attached to the same entry."
      action={
        <div className="flex flex-col gap-3 sm:flex-row">
          <DateRangeFilter value={range} onChange={setRange} />
          <AppButton
            onClick={() => {
              setSelectedEntry(undefined);
              setEntryDialogOpen(true);
            }}
          >
            + New entry
          </AppButton>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          <Surface className="p-5">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Journal desk</p>
                <h3 className="font-display mt-3 text-4xl font-extrabold text-[var(--text-strong)]">
                  Enter expenses with the same playful, clear card rhythm as the reference UI.
                </h3>
              </div>
              <div className="rounded-[26px] border-2 border-[var(--border-subtle)] bg-[var(--surface-chip-mint)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Fast mobile flow</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-body)]">
                  Date, particular, items, payment. The totals, ledgers, and dues update from the same source entry.
                </p>
              </div>
            </div>
          </Surface>

          <Surface className="p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <TextInput className="pl-10" placeholder="Search particular, item, or amount" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </Surface>

          <div className="grid gap-4">
            {entries.map((entry) => {
              const summary = getEntrySummary(entry);
              const tone = summary.paymentStatus === "Paid" ? "success" : summary.paymentStatus === "Pending" ? "muted" : "warning";

              return (
                <Surface key={entry.id} className="overflow-hidden">
                  <button
                    className="w-full p-5 text-left transition duration-200 hover:bg-[rgba(255,255,255,0.35)]"
                    onClick={() => setSelectedEntry(entry)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--text-muted)]">{formatDate(entry.date)}</p>
                        <h3 className="font-display mt-2 text-[1.7rem] font-extrabold leading-tight text-[var(--text-strong)]">
                          {entry.particular}
                        </h3>
                      </div>
                      <StatusBadge tone={tone}>{summary.paymentStatus}</StatusBadge>
                    </div>
                    <div className="mt-5 grid gap-3 text-sm text-[var(--text-body)] sm:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Items</p>
                        <p className="mt-1 font-semibold text-[var(--text-strong)]">{entry.items.length}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Total</p>
                        <p className="mt-1 font-semibold text-[var(--text-strong)]">{formatCurrency(summary.totalPaise)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Paid</p>
                        <p className="mt-1 font-semibold text-[var(--text-strong)]">{formatCurrency(summary.paidPaise)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Outstanding</p>
                        <p className="mt-1 font-semibold text-[var(--text-strong)]">{formatCurrency(summary.outstandingPaise)}</p>
                      </div>
                    </div>
                  </button>
                </Surface>
              );
            })}
          </div>
        </div>

        <Surface className="sticky top-4 p-5">
          {selectedEntry ? (
            <>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Entry detail</p>
              <h3 className="font-display mt-2 text-4xl font-extrabold leading-tight text-[var(--text-strong)]">{selectedEntry.particular}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{formatDate(selectedEntry.date)}</p>

              <div className="mt-6 grid gap-3">
                {selectedEntry.items.map((item, index) => {
                  const account = data.itemAccounts.find((candidate) => candidate.id === item.itemAccountId);
                  return (
                    <div
                      key={item.id}
                      className="rounded-[22px] border-2 border-[var(--border-subtle)] p-4"
                      style={{ backgroundColor: index % 3 === 0 ? "var(--surface-chip-yellow)" : index % 3 === 1 ? "var(--surface-chip-lilac)" : "var(--surface-chip-mint)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-[var(--text-strong)]">{account?.name}</p>
                        <p className="font-semibold text-[var(--text-strong)]">{formatCurrency(item.amountPaise)}</p>
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        {item.quantity ? `Qty ${item.quantity}` : "Qty omitted"}{item.unit ? ` • ${item.unit}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
                  <span>Entry total</span>
                  <span>{formatCurrency(getEntrySummary(selectedEntry).totalPaise)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
                  <span>Paid</span>
                  <span>{formatCurrency(getEntrySummary(selectedEntry).paidPaise)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
                  <span>Outstanding</span>
                  <span>{formatCurrency(getEntrySummary(selectedEntry).outstandingPaise)}</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Payment history</h4>
                <div className="mt-3 grid gap-3">
                  {selectedEntry.payments.length ? (
                    selectedEntry.payments.map((payment, index) => (
                      <div
                        key={payment.id}
                        className="rounded-[22px] border-2 border-[var(--border-subtle)] p-4"
                        style={{ backgroundColor: index % 2 === 0 ? "var(--surface-card)" : "var(--surface-card-soft)" }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-[var(--text-body)]">{formatDate(payment.date)}</span>
                          <span className="font-semibold text-[var(--text-strong)]">{formatCurrency(payment.amountPaise)}</span>
                        </div>
                        {payment.note ? <p className="mt-2 text-sm text-[var(--text-muted)]">{payment.note}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">No payments recorded yet.</p>
                  )}
                </div>
              </div>

              {selectedEntry.attachments.length ? (
                <div className="mt-6">
                  <h4 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Bill photo</h4>
                  <div className="mt-3 overflow-hidden rounded-[24px] border border-[var(--border-subtle)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={selectedEntry.attachments[0].fileName} className="aspect-[4/3] w-full object-cover" src={selectedEntry.attachments[0].dataUrl} />
                  </div>
                </div>
              ) : null}

              {selectedEntry.notes ? (
                <div className="mt-6 rounded-[22px] border-2 border-[var(--border-subtle)] bg-[var(--surface-card-soft)] p-4">
                  <p className="text-sm leading-7 text-[var(--text-body)]">{selectedEntry.notes}</p>
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <AppButton
                  tone="secondary"
                  onClick={() => {
                    setEntryDialogOpen(true);
                  }}
                >
                  Edit
                </AppButton>
                <AppButton tone="secondary" onClick={() => setPaymentEntryId(selectedEntry.id)}>
                  Add payment
                </AppButton>
                <AppButton
                  tone="danger"
                  onClick={() => {
                    deleteEntry(selectedEntry.id);
                    setSelectedEntry(undefined);
                  }}
                >
                  Delete
                </AppButton>
              </div>
            </>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-center text-[var(--text-muted)]">
              Tap a journal entry to inspect items, payment history, attachments, and actions.
            </div>
          )}
        </Surface>
      </div>

      <EntryDialog entry={selectedEntry} open={entryDialogOpen} onClose={() => setEntryDialogOpen(false)} />
      <PaymentDialog entryId={paymentEntryId || ""} open={Boolean(paymentEntryId)} onClose={() => setPaymentEntryId(null)} />
    </AppShell>
  );
}
