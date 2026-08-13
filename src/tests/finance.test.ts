import { describe, expect, it } from "vitest";

import { calculateEntryTotal, deriveLedgers, getEntrySummary, normalizeName, parseMoneyInput } from "@/lib/finance";
import { demoData } from "@/lib/demo-data";

describe("finance helpers", () => {
  it("parses money input safely to paise", () => {
    expect(parseMoneyInput("15,200")).toBe(1520000);
    expect(parseMoneyInput("200000")).toBe(20000000);
  });

  it("normalizes item names for account matching", () => {
    expect(normalizeName(" Cement ")).toBe("cement");
    expect(normalizeName("CEMENT")).toBe("cement");
  });

  it("calculates totals from journal items", () => {
    const entry = demoData.journalEntries[1];
    expect(calculateEntryTotal(entry.items)).toBe(4320000);
  });

  it("derives ledgers from journal entry items", () => {
    const ledgers = deriveLedgers(demoData);
    const cement = ledgers.find((ledger) => ledger.accountName === "Cement");
    expect(cement?.entries).toHaveLength(2);
    expect(cement?.totalPaise).toBe(2170000);
  });

  it("computes outstanding from payments attached to the journal entry", () => {
    const entry = demoData.journalEntries[3];
    const summary = getEntrySummary(entry);
    expect(summary.totalPaise).toBe(1300000);
    expect(summary.paidPaise).toBe(900000);
    expect(summary.outstandingPaise).toBe(400000);
  });
});
