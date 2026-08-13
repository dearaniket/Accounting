export type PaymentStatus = "Paid" | "Partially Paid" | "Pending";

export type FilterPreset =
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "this-year"
  | "all-time"
  | "custom";

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  createdAt: string;
}

export interface ItemAccount {
  id: string;
  projectId: string;
  name: string;
  normalizedName: string;
  defaultUnit?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryItem {
  id: string;
  itemAccountId: string;
  quantity?: string;
  unit?: string;
  amountPaise: number;
}

export interface Payment {
  id: string;
  date: string;
  amountPaise: number;
  note?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  projectId: string;
  date: string;
  particular: string;
  notes?: string;
  items: JournalEntryItem[];
  payments: Payment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AppData {
  project: Project;
  itemAccounts: ItemAccount[];
  journalEntries: JournalEntry[];
}

export interface DateRange {
  preset: FilterPreset;
  from?: string;
  to?: string;
}

export interface EntryFormItemInput {
  id?: string;
  itemName: string;
  quantity?: string;
  unit?: string;
  amount: string;
}

export interface EntryFormAttachmentInput {
  id?: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
}

export interface EntryFormInput {
  id?: string;
  date: string;
  particular: string;
  notes?: string;
  amountPaid?: string;
  paymentDate?: string;
  paymentNote?: string;
  items: EntryFormItemInput[];
  attachments: EntryFormAttachmentInput[];
}

export interface PaymentInput {
  id?: string;
  entryId: string;
  date: string;
  amount: string;
  note?: string;
}

export interface LedgerRow {
  accountId: string;
  accountName: string;
  totalPaise: number;
  entries: {
    entryId: string;
    date: string;
    particular: string;
    amountPaise: number;
  }[];
  lastActivity?: string;
  isArchived: boolean;
}
