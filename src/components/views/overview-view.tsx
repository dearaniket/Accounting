"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { DateRangeFilter } from "@/components/date-range-filter";
import { useAppData } from "@/components/providers/app-provider";
import { AppButton, StatusBadge } from "@/components/ui";
import { buildDashboard, formatCurrency, formatDate } from "@/lib/finance";
import { DateRange } from "@/lib/types";
import {
  Bar, BarChart, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const rangeDefaults: DateRange = { preset: "all-time" };

/* Indigo-themed chart palette */
const chartColors = ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6", "#06B6D4"];

function fmtTooltip(value: string | number | readonly (string | number)[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw !== undefined ? formatCurrency(Number(raw)) : "";
}

/* ─── Metric Tile ────────────────────────────────────────────────────── */
function MetricTile({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div
      className="flex flex-col rounded-[var(--radius-lg)] p-5"
      style={
        accent
          ? {
              background: "linear-gradient(135deg, var(--accent-dim), rgba(99,102,241,0.06))",
              border: "1px solid var(--border-accent)",
            }
          : { background: "var(--bg-card-muted)", border: "1px solid var(--border)" }
      }
    >
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent ? "var(--accent)" : "var(--text-faint)" }}>
        {label}
      </p>
      <p
        className="font-display mt-3 text-3xl font-bold leading-tight"
        style={{ color: "var(--text-primary)", textShadow: accent ? "0 0 30px var(--accent-glow)" : "none" }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

/* ─── Chart Card ─────────────────────────────────────────────────────── */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-[var(--radius-lg)] p-5">
      <p className="font-display text-xl font-bold text-[var(--text-primary)]">{title}</p>
      <div className="mt-4 h-[280px]">{children}</div>
    </div>
  );
}

/* ─── List Card ──────────────────────────────────────────────────────── */
function ListCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-[var(--radius-lg)] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-display text-xl font-bold text-[var(--text-primary)]">{title}</p>
        {action}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

/* ─── Row Item ───────────────────────────────────────────────────────── */
function Row({
  label,
  sub,
  right,
  badge,
  accentBg,
}: {
  label: string;
  sub?: string;
  right: string;
  badge?: React.ReactNode;
  accentBg?: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] px-4 py-3"
      style={{ background: accentBg ?? "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        {sub && <p className="text-xs text-[var(--text-muted)]">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        <p className="font-display text-sm font-bold text-[var(--text-primary)]">{right}</p>
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-sm)] px-3 py-2 text-sm" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)" }}>
      <p className="text-[var(--text-muted)]">{label}</p>
      <p className="font-bold text-[var(--text-primary)]">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

/* ─── Overview View ──────────────────────────────────────────────────── */
export function OverviewView() {
  const { data } = useAppData();
  const [range, setRange] = useState<DateRange>(rangeDefaults);
  const dashboard = buildDashboard(data, range);

  return (
    <AppShell
      title="Overview"
      description="Track your construction expenses, outstanding dues, and cash flow at a glance."
      action={<DateRangeFilter value={range} onChange={setRange} />}
    >
      <div className="flex flex-col gap-5">

        {/* Metric tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <MetricTile label="Total expense"   value={formatCurrency(dashboard.metrics.totalExpensePaise)} accent />
          <MetricTile label="Total paid"      value={formatCurrency(dashboard.metrics.totalPaidPaise)} />
          <MetricTile label="Outstanding"     value={formatCurrency(dashboard.metrics.outstandingPaise)} />
          <MetricTile label="Journal entries" value={`${dashboard.metrics.journalEntries}`} />
          <MetricTile label="Item accounts"   value={`${dashboard.metrics.itemAccounts}`} />
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <ChartCard title="Monthly expense trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.monthlyTrend} barSize={24}>
                <XAxis dataKey="month" stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-faint)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${Math.round(v / 100)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="expensePaise" radius={[8, 8, 0, 0]} fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Payment status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.paymentStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {dashboard.paymentStatus.map((item, i) => (
                    <Cell key={item.status} fill={chartColors[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} entries`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <ChartCard title="Cumulative spend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.monthlyTrend}>
                <XAxis dataKey="month" stroke="var(--text-faint)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-faint)" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${Math.round(v / 100)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="cumulativePaise"
                  stroke="var(--success)"
                  strokeWidth={3}
                  dot={false}
                  strokeLinecap="round"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ListCard title="Top accounts">
            {dashboard.topAccounts.length ? (
              dashboard.topAccounts.map((acc, i) => (
                <div
                  key={acc.name}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] px-4 py-3"
                  style={{ background: `${chartColors[i % chartColors.length]}18`, border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: chartColors[i % chartColors.length] }}
                    />
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{acc.name}</p>
                  </div>
                  <p className="font-display text-sm font-bold text-[var(--text-primary)]">{formatCurrency(acc.totalPaise)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-faint)]">No data for this range.</p>
            )}
          </ListCard>
        </div>

        {/* Lists row */}
        <div className="grid gap-5 xl:grid-cols-3">
          <ListCard title="Recent entries">
            {dashboard.recentEntries.map((e) => (
              <Row
                key={e.id}
                label={e.particular}
                sub={formatDate(e.date)}
                right={formatCurrency(e.totalPaise)}
                badge={
                  <StatusBadge tone={e.paymentStatus === "Paid" ? "success" : e.paymentStatus === "Pending" ? "muted" : "warning"}>
                    {e.paymentStatus}
                  </StatusBadge>
                }
              />
            ))}
          </ListCard>

          <ListCard title="Recent payments">
            {dashboard.recentPayments.map((p, i) => (
              <Row
                key={`${p.entryId}-${i}`}
                label={p.particular}
                sub={formatDate(p.date)}
                right={formatCurrency(p.amountPaise)}
                accentBg="var(--success-dim)"
              />
            ))}
          </ListCard>

          <ListCard
            title="Outstanding dues"
            action={
              <AppButton tone="secondary" className="text-xs">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                View all
              </AppButton>
            }
          >
            {dashboard.outstandingEntries.length ? (
              dashboard.outstandingEntries.map((e) => (
                <Row
                  key={e.id}
                  label={e.particular}
                  sub={formatDate(e.date)}
                  right={formatCurrency(e.outstandingPaise)}
                  accentBg="var(--warning-dim)"
                />
              ))
            ) : (
              <p className="py-4 text-center text-sm text-[var(--success)]">🎉 All bills settled!</p>
            )}
          </ListCard>
        </div>
      </div>
    </AppShell>
  );
}
