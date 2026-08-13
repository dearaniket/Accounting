"use client";

import { WalletCards } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DateRangeFilter } from "@/components/date-range-filter";
import { useAppData } from "@/components/providers/app-provider";
import { AppButton, StatusBadge, Surface } from "@/components/ui";
import { buildDashboard, formatCurrency, formatDate } from "@/lib/finance";
import { DateRange } from "@/lib/types";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const rangeDefaults: DateRange = { preset: "all-time" };
const chartColors = ["#f6e56a", "#c9c1ff", "#9fe7d8", "#ff8d87", "#f4d6ff", "#bfe1ff"];

function formatTooltipValue(value: string | number | readonly (string | number)[] | undefined) {
  if (value === undefined) {
    return "";
  }

  const raw = Array.isArray(value) ? value[0] : value;
  return formatCurrency(Number(raw));
}

export function OverviewView() {
  const { data } = useAppData();
  const [range, setRange] = useState<DateRange>(rangeDefaults);
  const dashboard = buildDashboard(data, range);

  return (
    <AppShell
      title="Overview"
      description="Track construction expenses, current cash outflow, outstanding dues, and the accounts driving project cost."
      action={<DateRangeFilter value={range} onChange={setRange} />}
    >
      <div className="grid gap-6">
        <Surface className="overflow-hidden p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Field finance snapshot</p>
              <h3 className="font-display mt-3 text-4xl font-extrabold text-[var(--text-strong)] sm:text-5xl">
                Construction payments, restyled like the mobile wallet UI you shared.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
                The journal stays fast for on-site entry, while the system quietly organizes payments, accounts, and trends in the background.
              </p>
            </div>
            <div className="rounded-[28px] border-2 border-[var(--border-subtle)] bg-[var(--surface-chip-yellow)] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Current outstanding</p>
              <p className="font-display mt-3 text-4xl font-extrabold text-[var(--text-strong)]">
                {formatCurrency(dashboard.metrics.outstandingPaise)}
              </p>
              <p className="mt-3 text-sm text-[var(--text-body)]">
                Payments are attached to the same journal entry, so dues stay traceable instead of splitting across screens.
              </p>
            </div>
          </div>
        </Surface>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total project expense", formatCurrency(dashboard.metrics.totalExpensePaise)],
            ["Total paid", formatCurrency(dashboard.metrics.totalPaidPaise)],
            ["Outstanding", formatCurrency(dashboard.metrics.outstandingPaise)],
            ["Journal entries", `${dashboard.metrics.journalEntries}`],
            ["Item accounts", `${dashboard.metrics.itemAccounts}`],
          ].map(([label, value]) => (
            <Surface key={label} className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
              <p className="font-display mt-4 text-4xl font-extrabold tracking-tight text-[var(--text-strong)]">{value}</p>
            </Surface>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Surface className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Monthly expense trend</h3>
                <p className="text-sm text-[var(--text-muted)]">All charts are computed from journal items and payments.</p>
              </div>
              <WalletCards className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.monthlyTrend}>
                  <XAxis dataKey="month" stroke="#737184" />
                  <YAxis stroke="#737184" tickFormatter={(value) => `₹${Math.round(value / 100)}`} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Bar dataKey="expensePaise" radius={[10, 10, 0, 0]} fill="#f6e56a" stroke="#111111" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Surface>

          <Surface className="p-5">
            <h3 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Payment status mix</h3>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboard.paymentStatus} dataKey="count" nameKey="status" innerRadius={70} outerRadius={105}>
                    {dashboard.paymentStatus.map((item, index) => (
                      <Cell key={item.status} fill={chartColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Surface>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Surface className="p-5">
            <h3 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Cumulative project expense</h3>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.monthlyTrend}>
                  <XAxis dataKey="month" stroke="#737184" />
                  <YAxis stroke="#737184" tickFormatter={(value) => `₹${Math.round(value / 100)}`} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Line type="monotone" dataKey="cumulativePaise" stroke="#9fe7d8" strokeWidth={4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Surface>

          <Surface className="p-5">
            <h3 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Top spending accounts</h3>
            <div className="mt-5 grid gap-3">
              {dashboard.topAccounts.length ? (
                dashboard.topAccounts.map((account, index) => (
                  <div
                    key={account.name}
                    className="rounded-[22px] border-2 border-[var(--border-subtle)] p-4"
                    style={{ backgroundColor: index % 3 === 0 ? "var(--surface-chip-yellow)" : index % 3 === 1 ? "var(--surface-chip-lilac)" : "var(--surface-chip-mint)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[var(--text-strong)]">{account.name}</p>
                      <p className="text-sm font-semibold text-[var(--text-body)]">{formatCurrency(account.totalPaise)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No journal data for this range yet.</p>
              )}
            </div>
          </Surface>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Surface className="p-5">
            <h3 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Recent journal entries</h3>
            <div className="mt-4 grid gap-3">
              {dashboard.recentEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="rounded-[22px] border-2 border-[var(--border-subtle)] p-4"
                  style={{ backgroundColor: index % 2 === 0 ? "var(--surface-card)" : "var(--surface-card-soft)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--text-strong)]">{entry.particular}</p>
                      <p className="text-sm text-[var(--text-muted)]">{formatDate(entry.date)}</p>
                    </div>
                    <StatusBadge tone={entry.paymentStatus === "Paid" ? "success" : entry.paymentStatus === "Pending" ? "muted" : "warning"}>
                      {entry.paymentStatus}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-body)]">
                    <span>Total</span>
                    <span>{formatCurrency(entry.totalPaise)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="p-5">
            <h3 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Recent payments</h3>
            <div className="mt-4 grid gap-3">
              {dashboard.recentPayments.map((payment, index) => (
                <div
                  key={`${payment.entryId}-${index}`}
                  className="rounded-[22px] border-2 border-[var(--border-subtle)] p-4"
                  style={{ backgroundColor: index % 2 === 0 ? "var(--surface-chip-mint)" : "var(--surface-card)" }}
                >
                  <p className="font-semibold text-[var(--text-strong)]">{payment.particular}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-[var(--text-body)]">
                    <span>{formatDate(payment.date)}</span>
                    <span>{formatCurrency(payment.amountPaise)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl font-extrabold text-[var(--text-strong)]">Outstanding payments</h3>
              <AppButton tone="secondary" className="hidden sm:inline-flex">
                Review dues
              </AppButton>
            </div>
            <div className="grid gap-3">
              {dashboard.outstandingEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="rounded-[22px] border-2 border-[var(--border-subtle)] p-4"
                  style={{ backgroundColor: index % 2 === 0 ? "var(--surface-chip-lilac)" : "var(--surface-card)" }}
                >
                  <p className="font-semibold text-[var(--text-strong)]">{entry.particular}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-[var(--text-body)]">
                    <span>{formatDate(entry.date)}</span>
                    <span>{formatCurrency(entry.outstandingPaise)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </AppShell>
  );
}
