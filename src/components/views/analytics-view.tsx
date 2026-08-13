"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/app-shell";
import { DateRangeFilter } from "@/components/date-range-filter";
import { useAppData } from "@/components/providers/app-provider";
import { Surface } from "@/components/ui";
import { buildDashboard, formatCurrency } from "@/lib/finance";
import { DateRange } from "@/lib/types";

const rangeDefaults: DateRange = { preset: "all-time" };
const chartColors = ["#3b82f6", "#059669", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatTooltipValue(value: string | number | readonly (string | number)[] | undefined) {
  if (value === undefined) {
    return "";
  }

  const raw = Array.isArray(value) ? value[0] : value;
  return formatCurrency(Number(raw));
}

export function AnalyticsView() {
  const { data } = useAppData();
  const [range, setRange] = useState<DateRange>(rangeDefaults);
  const dashboard = buildDashboard(data, range);
  const comparison = dashboard.monthlyTrend.slice(-2);

  return (
    <AppShell
      title="Analytics"
      description="Read project cost trends, item distribution, monthly comparisons, and payment status from live journal data with responsive charts and empty-safe views."
      action={<DateRangeFilter value={range} onChange={setRange} />}
    >
      <div className="grid gap-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <Surface className="p-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Item-wise expense</h3>
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.distribution.slice(0, 8)}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${Math.round(value / 100)}`} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Bar dataKey="totalPaise" radius={[10, 10, 0, 0]} fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Surface>

          <Surface className="p-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Expense distribution</h3>
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboard.distribution.slice(0, 6)} dataKey="totalPaise" nameKey="name" innerRadius={72} outerRadius={110}>
                    {dashboard.distribution.slice(0, 6).map((item, index) => (
                      <Cell key={item.name} fill={chartColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatTooltipValue} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Surface>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Surface className="p-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Top accounts</h3>
            <div className="mt-4 grid gap-3">
              {dashboard.topAccounts.map((account, index) => (
                <div key={account.name} className="rounded-[22px] border border-[var(--border-subtle)] bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <p className="font-semibold text-[var(--text-strong)]">{account.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-body)]">{formatCurrency(account.totalPaise)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="p-5">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Monthly comparison</h3>
            <div className="mt-4 grid gap-3">
              {comparison.length ? (
                comparison.map((row) => (
                  <div key={row.month} className="rounded-[22px] border border-[var(--border-subtle)] bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[var(--text-strong)]">{row.month}</p>
                      <p className="font-semibold text-[var(--text-strong)]">{formatCurrency(row.expensePaise)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Add more month-by-month data to compare periods.</p>
              )}
            </div>
          </Surface>
        </div>
      </div>
    </AppShell>
  );
}
