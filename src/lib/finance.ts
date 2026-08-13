import {
  AppData,
  DateRange,
  FilterPreset,
  JournalEntry,
  LedgerRow,
  Payment,
  PaymentStatus,
} from "@/lib/types";

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseMoneyInput(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return 0;
  }

  const isNegative = normalized.startsWith("-");
  const unsigned = isNegative ? normalized.slice(1) : normalized;
  const [wholePart = "0", decimalPart = ""] = unsigned.split(".");
  const safeWhole = wholePart.replace(/\D/g, "") || "0";
  const safeDecimal = decimalPart.replace(/\D/g, "").slice(0, 2).padEnd(2, "0");
  const paise = Number.parseInt(safeWhole, 10) * 100 + Number.parseInt(safeDecimal || "0", 10);

  return isNegative ? -paise : paise;
}

export function formatCurrency(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100);
}

export function formatCurrencyInput(amountPaise: number) {
  return amountPaise ? `${amountPaise / 100}` : "";
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatMonth(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function calculateEntryTotal(items: { amountPaise: number }[]) {
  return items.reduce((sum, item) => sum + item.amountPaise, 0);
}

export function calculateTotalPaid(payments: Payment[]) {
  return payments.reduce((sum, payment) => sum + payment.amountPaise, 0);
}

export function getPaymentStatus(totalPaise: number, paidPaise: number): PaymentStatus {
  if (paidPaise >= totalPaise && totalPaise > 0) {
    return "Paid";
  }

  if (paidPaise > 0) {
    return "Partially Paid";
  }

  return "Pending";
}

export function getOutstanding(totalPaise: number, paidPaise: number) {
  return Math.max(totalPaise - paidPaise, 0);
}

export function getEntrySummary(entry: JournalEntry) {
  const totalPaise = calculateEntryTotal(entry.items);
  const paidPaise = calculateTotalPaid(entry.payments);
  const outstandingPaise = getOutstanding(totalPaise, paidPaise);

  return {
    totalPaise,
    paidPaise,
    outstandingPaise,
    paymentStatus: getPaymentStatus(totalPaise, paidPaise),
  };
}

function presetToRange(preset: FilterPreset) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (preset === "all-time") {
    return {};
  }

  if (preset === "this-month") {
    return {
      from: new Date(year, month, 1).toISOString().slice(0, 10),
      to: new Date(year, month + 1, 0).toISOString().slice(0, 10),
    };
  }

  if (preset === "last-month") {
    return {
      from: new Date(year, month - 1, 1).toISOString().slice(0, 10),
      to: new Date(year, month, 0).toISOString().slice(0, 10),
    };
  }

  if (preset === "last-3-months") {
    return {
      from: new Date(year, month - 2, 1).toISOString().slice(0, 10),
      to: new Date(year, month + 1, 0).toISOString().slice(0, 10),
    };
  }

  return {
    from: new Date(year, 0, 1).toISOString().slice(0, 10),
    to: new Date(year, 11, 31).toISOString().slice(0, 10),
  };
}

export function withinRange(date: string, range: DateRange) {
  const resolved =
    range.preset === "custom"
      ? { from: range.from, to: range.to }
      : presetToRange(range.preset);

  if (resolved.from && date < resolved.from) {
    return false;
  }

  if (resolved.to && date > resolved.to) {
    return false;
  }

  return true;
}

export function filterEntries(entries: JournalEntry[], range: DateRange) {
  return entries.filter((entry) => !entry.deletedAt && withinRange(entry.date, range));
}

export function deriveLedgers(data: AppData, range?: DateRange) {
  const rows = new Map<string, LedgerRow>();
  const entries = range ? filterEntries(data.journalEntries, range) : data.journalEntries.filter((entry) => !entry.deletedAt);

  for (const account of data.itemAccounts) {
    rows.set(account.id, {
      accountId: account.id,
      accountName: account.name,
      totalPaise: 0,
      entries: [],
      lastActivity: undefined,
      isArchived: account.isArchived,
    });
  }

  for (const entry of entries) {
    for (const item of entry.items) {
      const row = rows.get(item.itemAccountId);

      if (!row) {
        continue;
      }

      row.entries.push({
        entryId: entry.id,
        date: entry.date,
        particular: entry.particular,
        amountPaise: item.amountPaise,
      });
      row.totalPaise += item.amountPaise;
      row.lastActivity = row.lastActivity && row.lastActivity > entry.date ? row.lastActivity : entry.date;
    }
  }

  return [...rows.values()].filter((row) => row.entries.length > 0 || !row.isArchived);
}

export function buildDashboard(data: AppData, range: DateRange) {
  const entries = filterEntries(data.journalEntries, range);
  const ledgerRows = deriveLedgers(data, range).filter((row) => row.entries.length);
  const totalExpensePaise = entries.reduce((sum, entry) => sum + getEntrySummary(entry).totalPaise, 0);
  const totalPaidPaise = entries.reduce((sum, entry) => sum + getEntrySummary(entry).paidPaise, 0);
  const outstandingPaise = entries.reduce((sum, entry) => sum + getEntrySummary(entry).outstandingPaise, 0);

  const monthMap = new Map<string, { month: string; expensePaise: number; cumulativePaise: number }>();
  const accountMap = new Map<string, number>();
  const statusMap = new Map<PaymentStatus, number>([
    ["Paid", 0],
    ["Partially Paid", 0],
    ["Pending", 0],
  ]);

  let running = 0;
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sortedEntries) {
    const summary = getEntrySummary(entry);
    const month = formatMonth(entry.date);
    const monthRow = monthMap.get(month) ?? { month, expensePaise: 0, cumulativePaise: 0 };
    monthRow.expensePaise += summary.totalPaise;
    running += summary.totalPaise;
    monthRow.cumulativePaise = running;
    monthMap.set(month, monthRow);
    statusMap.set(summary.paymentStatus, (statusMap.get(summary.paymentStatus) ?? 0) + 1);

    for (const item of entry.items) {
      accountMap.set(item.itemAccountId, (accountMap.get(item.itemAccountId) ?? 0) + item.amountPaise);
    }
  }

  const topAccounts = ledgerRows
    .map((row) => ({ name: row.accountName, totalPaise: row.totalPaise }))
    .sort((a, b) => b.totalPaise - a.totalPaise)
    .slice(0, 5);

  const distribution = [...accountMap.entries()]
    .map(([accountId, totalPaise]) => ({
      name: data.itemAccounts.find((account) => account.id === accountId)?.name ?? "Unknown",
      totalPaise,
    }))
    .sort((a, b) => b.totalPaise - a.totalPaise);

  return {
    metrics: {
      totalExpensePaise,
      totalPaidPaise,
      outstandingPaise,
      journalEntries: entries.length,
      itemAccounts: data.itemAccounts.filter((account) => !account.isArchived).length,
    },
    monthlyTrend: [...monthMap.values()],
    topAccounts,
    distribution,
    paymentStatus: [...statusMap.entries()].map(([status, count]) => ({ status, count })),
    recentEntries: [...entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map((entry) => ({
        id: entry.id,
        date: entry.date,
        particular: entry.particular,
        ...getEntrySummary(entry),
      })),
    recentPayments: entries
      .flatMap((entry) =>
        entry.payments.map((payment) => ({
          entryId: entry.id,
          particular: entry.particular,
          date: payment.date,
          amountPaise: payment.amountPaise,
        })),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
    outstandingEntries: entries
      .map((entry) => ({
        id: entry.id,
        date: entry.date,
        particular: entry.particular,
        ...getEntrySummary(entry),
      }))
      .filter((entry) => entry.outstandingPaise > 0)
      .sort((a, b) => b.outstandingPaise - a.outstandingPaise)
      .slice(0, 5),
  };
}
