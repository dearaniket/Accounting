import { AppData } from "@/lib/types";
import { makeId, normalizeName, parseMoneyInput } from "@/lib/finance";

const projectId = "project-house-ledger";
const now = "2026-08-13T10:00:00.000Z";

function account(name: string, defaultUnit?: string) {
  return {
    id: makeId("account"),
    projectId,
    name,
    normalizedName: normalizeName(name),
    defaultUnit,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

const itemAccounts = [
  account("Cement", "bags"),
  account("Bricks", "pieces"),
  account("Gravel", "load"),
  account("Crushed Stone", "load"),
  account("Labour", "days"),
  account("Pipelin"),
  account("Cabeling"),
];

function accountId(name: string) {
  return itemAccounts.find((entry) => entry.name === name)?.id ?? "";
}

function item(name: string, amount: string, quantity?: string, unit?: string) {
  return {
    id: makeId("item"),
    itemAccountId: accountId(name),
    quantity,
    unit,
    amountPaise: parseMoneyInput(amount),
  };
}

function payment(amount: string, date: string, note?: string) {
  return {
    id: makeId("payment"),
    date,
    amountPaise: parseMoneyInput(amount),
    note,
    createdAt: now,
  };
}

export const demoData: AppData = {
  project: {
    id: projectId,
    name: "House Rebuild Demo Project",
    description: "Demo data for construction expense tracking and ledgers.",
    startDate: "2026-02-18",
    createdAt: now,
  },
  itemAccounts,
  journalEntries: [
    {
      id: makeId("entry"),
      projectId,
      date: "2026-02-18",
      particular: "BridgeMohan Labour Bill 1",
      notes: "Demo data: initial labour settlement for foundation work.",
      items: [item("Labour", "200000")],
      payments: [payment("100000", "2026-02-18", "Advance"), payment("100000", "2026-02-25", "Cleared")],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("entry"),
      projectId,
      date: "2026-03-24",
      particular: "BridgeMohan Bill 3",
      notes: "Demo data based on the paper journal example.",
      items: [
        item("Cement", "15200", "50", "bags"),
        item("Bricks", "10000", "1000", "pieces"),
        item("Gravel", "8000", "1", "load"),
        item("Crushed Stone", "10000", "1", "load"),
      ],
      payments: [payment("25000", "2026-03-24", "On-site payment"), payment("18200", "2026-03-28", "Balance")],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("entry"),
      projectId,
      date: "2026-05-30",
      particular: "BridgeMohan Bill 7",
      notes: "Demo data: gravel load only.",
      items: [item("Gravel", "8000", "1", "load")],
      payments: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("entry"),
      projectId,
      date: "2026-06-15",
      particular: "Patel Building Material Bill 2",
      notes: "Demo data: cement and gravel restock.",
      items: [item("Cement", "6500", "20", "bags"), item("Gravel", "6500", "10", "load")],
      payments: [payment("9000", "2026-06-15", "Part payment")],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: makeId("entry"),
      projectId,
      date: "2026-08-12",
      particular: "AC Pipelining and cabeling",
      notes: "Demo data: utility installation work.",
      items: [item("Pipelin", "20000"), item("Cabeling", "20000")],
      payments: [payment("10000", "2026-08-12", "Initial transfer")],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
  ],
};
