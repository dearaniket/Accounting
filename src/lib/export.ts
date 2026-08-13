import jsPDF from "jspdf";
import * as XLSX from "xlsx";

import { buildDashboard, deriveLedgers, filterEntries, formatCurrency, formatDate, getEntrySummary } from "@/lib/finance";
import { AppData, DateRange } from "@/lib/types";

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportJournalCsv(data: AppData, range: DateRange) {
  const rows = filterEntries(data.journalEntries, range).map((entry) => {
    const summary = getEntrySummary(entry);

    return {
      Date: entry.date,
      Particular: entry.particular,
      Items: entry.items.length,
      Total: summary.totalPaise / 100,
      Paid: summary.paidPaise / 100,
      Outstanding: summary.outstandingPaise / 100,
      Status: summary.paymentStatus,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Journal");
  XLSX.writeFile(workbook, "journal-export.xlsx");
}

export function exportLedgerCsv(data: AppData, range: DateRange) {
  const rows = deriveLedgers(data, range).flatMap((ledger) =>
    ledger.entries.map((entry) => ({
      Account: ledger.accountName,
      Date: entry.date,
      Particular: entry.particular,
      Amount: entry.amountPaise / 100,
    })),
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ledgers");
  XLSX.writeFile(workbook, "ledger-export.xlsx");
}

export function exportOutstandingPdf(data: AppData, range: DateRange) {
  const dashboard = buildDashboard(data, range);
  const pdf = new jsPDF();
  let y = 16;

  pdf.setFontSize(18);
  pdf.text("Outstanding Payments Report", 14, y);
  y += 10;

  pdf.setFontSize(11);
  dashboard.outstandingEntries.forEach((entry) => {
    pdf.text(`${formatDate(entry.date)}  ${entry.particular}`, 14, y);
    y += 6;
    pdf.text(`Outstanding: ${formatCurrency(entry.outstandingPaise)}`, 18, y);
    y += 8;
  });

  downloadBlob(pdf.output("blob"), "outstanding-payments.pdf");
}
