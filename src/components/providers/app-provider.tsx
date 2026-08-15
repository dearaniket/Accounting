"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { demoData } from "@/lib/demo-data";
import { makeId, normalizeName, parseMoneyInput } from "@/lib/finance";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { AppData, EntryFormInput, ItemAccount, PaymentInput } from "@/lib/types";

const UI_STORAGE_KEY = "house-ledger-ui-settings";

interface AppContextValue {
  data: AppData;
  darkMode: boolean;
  fakeDataEnabled: boolean;
  resetDemoData: () => void;
  setDarkMode: (enabled: boolean) => void;
  setFakeDataEnabled: (enabled: boolean) => void;
  saveEntry: (input: EntryFormInput) => void;
  deleteEntry: (entryId: string) => void;
  addPayment: (input: PaymentInput) => void;
  renameAccount: (accountId: string, name: string) => void;
  archiveAccount: (accountId: string) => void;
  restoreAccount: (accountId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function createEmptyData(): AppData {
  const now = new Date().toISOString();

  return {
    project: {
      id: "project-house-ledger",
      name: "House Rebuild Project",
      description: "Live project data",
      startDate: "2026-08-13",
      createdAt: now,
    },
    itemAccounts: [],
    journalEntries: [],
  };
}

function loadUiSettings() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(UI_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as { darkMode: boolean; fakeDataEnabled: boolean }) : null;
}

function upsertAccount(itemAccounts: ItemAccount[], projectId: string, name: string, unit?: string) {
  const normalizedName = normalizeName(name);
  const existing = itemAccounts.find((account) => account.normalizedName === normalizedName);

  if (existing) {
    return {
      itemAccounts: itemAccounts.map((account) =>
        account.id === existing.id
          ? {
              ...account,
              name: account.name,
              defaultUnit: account.defaultUnit || unit,
              updatedAt: new Date().toISOString(),
            }
          : account,
      ),
      accountId: existing.id,
    };
  }

  const nextAccount: ItemAccount = {
    id: makeId("account"),
    projectId,
    name: name.trim(),
    normalizedName,
    defaultUnit: unit?.trim() || undefined,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { itemAccounts: [...itemAccounts, nextAccount], accountId: nextAccount.id };
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Always start with demoData so SSR and client initial renders match,
  // then immediately overwrite from localStorage on the client.
  const [data, setData] = useState<AppData>(demoData);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [fakeDataEnabled, setFakeDataEnabledState] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after first client render
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setData(stored);
    const ui = loadUiSettings();
    if (ui) {
      setDarkModeState(ui.darkMode);
      setFakeDataEnabledState(ui.fakeDataEnabled);
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return; // don't overwrite localStorage with demoData on first render
    saveToStorage(data);
  }, [data, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({
        darkMode,
        fakeDataEnabled,
      }),
    );
  }, [darkMode, fakeDataEnabled]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      darkMode,
      fakeDataEnabled,
      resetDemoData: () => setData(demoData),
      setDarkMode: (enabled) => setDarkModeState(enabled),
      setFakeDataEnabled: (enabled) => {
        setFakeDataEnabledState(enabled);
        setData(enabled ? demoData : createEmptyData());
      },
      saveEntry: (input) => {
        setData((current) => {
          let itemAccounts = [...current.itemAccounts];

          const items = input.items.map((item) => {
            const result = upsertAccount(itemAccounts, current.project.id, item.itemName, item.unit);
            itemAccounts = result.itemAccounts;

            return {
              id: item.id ?? makeId("item"),
              itemAccountId: result.accountId,
              quantity: item.quantity?.trim() || undefined,
              unit: item.unit?.trim() || undefined,
              amountPaise: parseMoneyInput(item.amount),
            };
          });

          const initialPayment = parseMoneyInput(input.amountPaid || "");
          const payments =
            initialPayment > 0
              ? [
                  {
                    id: makeId("payment"),
                    date: input.paymentDate || input.date,
                    amountPaise: initialPayment,
                    note: input.paymentNote?.trim() || undefined,
                    createdAt: new Date().toISOString(),
                  },
                ]
              : [];

          const nextEntry = {
            id: input.id ?? makeId("entry"),
            projectId: current.project.id,
            date: input.date,
            particular: input.particular.trim(),
            notes: input.notes?.trim() || undefined,
            items,
            payments,
            attachments: input.attachments.map((attachment) => ({
              id: attachment.id ?? makeId("attachment"),
              fileName: attachment.fileName,
              mimeType: attachment.mimeType,
              size: attachment.size,
              dataUrl: attachment.dataUrl,
              createdAt: new Date().toISOString(),
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const existing = current.journalEntries.find((entry) => entry.id === input.id);
          const journalEntries = existing
            ? current.journalEntries.map((entry) =>
                entry.id === input.id
                  ? {
                      ...entry,
                      ...nextEntry,
                      payments: existing.payments.length ? existing.payments : payments,
                      createdAt: entry.createdAt,
                    }
                  : entry,
              )
            : [nextEntry, ...current.journalEntries];

          return { ...current, itemAccounts, journalEntries };
        });
      },
      deleteEntry: (entryId) => {
        setData((current) => ({
          ...current,
          journalEntries: current.journalEntries.map((entry) =>
            entry.id === entryId ? { ...entry, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : entry,
          ),
        }));
      },
      addPayment: (input) => {
        setData((current) => ({
          ...current,
          journalEntries: current.journalEntries.map((entry) =>
            entry.id === input.entryId
              ? {
                  ...entry,
                  payments: [
                    ...entry.payments,
                    {
                      id: input.id ?? makeId("payment"),
                      date: input.date,
                      amountPaise: parseMoneyInput(input.amount),
                      note: input.note?.trim() || undefined,
                      createdAt: new Date().toISOString(),
                    },
                  ].sort((a, b) => a.date.localeCompare(b.date)),
                  updatedAt: new Date().toISOString(),
                }
              : entry,
          ),
        }));
      },
      renameAccount: (accountId, name) => {
        setData((current) => ({
          ...current,
          itemAccounts: current.itemAccounts.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  name: name.trim(),
                  normalizedName: normalizeName(name),
                  updatedAt: new Date().toISOString(),
                }
              : account,
          ),
        }));
      },
      archiveAccount: (accountId) => {
        setData((current) => ({
          ...current,
          itemAccounts: current.itemAccounts.map((account) =>
            account.id === accountId ? { ...account, isArchived: true, updatedAt: new Date().toISOString() } : account,
          ),
        }));
      },
      restoreAccount: (accountId) => {
        setData((current) => ({
          ...current,
          itemAccounts: current.itemAccounts.map((account) =>
            account.id === accountId ? { ...account, isArchived: false, updatedAt: new Date().toISOString() } : account,
          ),
        }));
      },
    }),
    [darkMode, fakeDataEnabled, data],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
}
