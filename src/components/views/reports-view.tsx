"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DateRangeFilter } from "@/components/date-range-filter";
import { useAppData } from "@/components/providers/app-provider";
import { AppButton, Surface } from "@/components/ui";
import { exportJournalCsv, exportLedgerCsv, exportOutstandingPdf } from "@/lib/export";
import { buildDashboard, formatCurrency, formatDate } from "@/lib/finance";
import { DateRange } from "@/lib/types";

const rangeDefaults: DateRange = { preset: "all-time" };

export function ReportsView() {
  const { data } = useAppData();
  const [range, setRange] = useState<DateRange>(rangeDefaults);
  const dashboard = buildDashboard(data, range);

  return (
    <AppShell
      title="Reports"
      description="Export project-ready reports from the same live journal data: monthly expense views, ledger extracts, outstanding payments, and spreadsheet-friendly journal exports."
      action={<DateRangeFilter value={range} onChange={setRange} />}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <Surface className="p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Exports</p>
            <div className="mt-4 grid gap-3">
              <AppButton onClick={() => exportJournalCsv(data, range)}>Journal export (Excel)</AppButton>
              <AppButton tone="secondary" onClick={() => exportLedgerCsv(data, range)}>
                Item ledger report (Excel)
              </AppButton>
              <AppButton tone="secondary" onClick={() => exportOutstandingPdf(data, range)}>
                Outstanding payments (PDF)
              </AppButton>
            </div>
          </Surface>

          <Surface className="p-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Project summary</h3>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
                <span>Total expense</span>
                <span>{formatCurrency(dashboard.metrics.totalExpensePaise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
                <span>Total paid</span>
                <span>{formatCurrency(dashboard.metrics.totalPaidPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
                <span>Outstanding</span>
                <span>{formatCurrency(dashboard.metrics.outstandingPaise)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
                <span>Journal entries</span>
                <span>{dashboard.metrics.journalEntries}</span>
              </div>
            </div>
          </Surface>
        </div>

        <Surface className="p-5">
          <h3 className="text-xl font-bold text-[var(--text-strong)]">Outstanding payments</h3>
          <div className="mt-4 grid gap-3">
            {dashboard.outstandingEntries.map((entry) => (
              <div key={entry.id} className="rounded-[22px] border border-[var(--border-subtle)] bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--text-strong)]">{entry.particular}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{formatDate(entry.date)}</p>
                  </div>
                  <p className="font-semibold text-[var(--text-strong)]">{formatCurrency(entry.outstandingPaise)}</p>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
