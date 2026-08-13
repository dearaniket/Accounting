"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { useAppData } from "@/components/providers/app-provider";
import { AppButton, Surface, TextInput } from "@/components/ui";
import { deriveLedgers, formatCurrency, formatDate } from "@/lib/finance";

export function LedgersView() {
  const { data, archiveAccount, renameAccount, restoreAccount } = useAppData();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"alphabetical" | "total" | "recent">("total");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const ledgers = useMemo(() => {
    const rows = deriveLedgers(data);
    const query = search.trim().toLowerCase();
    const filtered = rows.filter((row) => !query || row.accountName.toLowerCase().includes(query));

    return filtered.sort((left, right) => {
      if (sort === "alphabetical") {
        return left.accountName.localeCompare(right.accountName);
      }

      if (sort === "recent") {
        return (right.lastActivity || "").localeCompare(left.lastActivity || "");
      }

      return right.totalPaise - left.totalPaise;
    });
  }, [data, search, sort]);

  const selected = ledgers.find((ledger) => ledger.accountId === selectedAccountId) ?? ledgers[0];

  return (
    <AppShell
      title="Ledgers"
      description="Each ledger is a derived view over journal entry items. No duplicate data entry, no manual ledger rows, and updates flow automatically from the source journal."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          <Surface className="p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <TextInput placeholder="Search account" value={search} onChange={(event) => setSearch(event.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <AppButton tone={sort === "alphabetical" ? "primary" : "secondary"} onClick={() => setSort("alphabetical")}>
                  A-Z
                </AppButton>
                <AppButton tone={sort === "total" ? "primary" : "secondary"} onClick={() => setSort("total")}>
                  Total
                </AppButton>
                <AppButton tone={sort === "recent" ? "primary" : "secondary"} onClick={() => setSort("recent")}>
                  Recent
                </AppButton>
              </div>
            </div>
          </Surface>

          <div className="grid gap-4">
            {ledgers.map((ledger) => (
              <Surface key={ledger.accountId} className={`p-5 ${selected?.accountId === ledger.accountId ? "border-[var(--border-strong)]" : ""}`}>
                <button className="w-full text-left" onClick={() => setSelectedAccountId(ledger.accountId)} type="button">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-strong)]">{ledger.accountName} A/c</h3>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">{ledger.entries.length} entries</p>
                    </div>
                    <p className="text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(ledger.totalPaise)}</p>
                  </div>
                </button>
              </Surface>
            ))}
          </div>
        </div>

        <Surface className="p-5">
          {selected ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Ledger detail</p>
                  <h3 className="mt-2 text-2xl font-bold text-[var(--text-strong)]">{selected.accountName} A/c</h3>
                </div>
                <div className="flex gap-2">
                  <AppButton
                    tone="secondary"
                    onClick={() => {
                      const nextName = window.prompt("Rename account", selected.accountName);
                      if (nextName?.trim()) {
                        renameAccount(selected.accountId, nextName);
                      }
                    }}
                  >
                    Rename
                  </AppButton>
                  {selected.isArchived ? (
                    <AppButton tone="secondary" onClick={() => restoreAccount(selected.accountId)}>
                      Restore
                    </AppButton>
                  ) : (
                    <AppButton tone="secondary" onClick={() => archiveAccount(selected.accountId)}>
                      Archive
                    </AppButton>
                  )}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--border-subtle)]">
                <table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
                  <thead className="bg-white/5 text-left text-[var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Particular</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.entries.map((entry) => (
                      <tr key={`${selected.accountId}-${entry.entryId}`} className="border-t border-[var(--border-subtle)]">
                        <td className="px-4 py-3 text-[var(--text-body)]">{formatDate(entry.date)}</td>
                        <td className="px-4 py-3 text-[var(--text-strong)]">{entry.particular}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[var(--text-strong)]">{formatCurrency(entry.amountPaise)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-[var(--border-subtle)] bg-white/5">
                      <td className="px-4 py-3 font-semibold text-[var(--text-strong)]">Total</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right font-semibold text-[var(--text-strong)]">{formatCurrency(selected.totalPaise)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-center text-[var(--text-muted)]">
              No ledger rows available yet.
            </div>
          )}
        </Surface>
      </div>
    </AppShell>
  );
}
