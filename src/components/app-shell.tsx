"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenText, FolderKanban, LayoutDashboard, ScrollText, Settings, WalletCards } from "lucide-react";
import { ReactNode } from "react";

import { AppButton } from "@/components/ui";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpenText },
  { href: "/ledgers", label: "Ledgers", icon: FolderKanban },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 pb-28 pt-4 lg:px-6 lg:pb-8">
        <aside className="panel hidden w-[292px] shrink-0 overflow-hidden rounded-[36px] p-5 lg:flex lg:flex-col">
          <div className="mb-8 rounded-[28px] border-2 border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--border-subtle)] bg-[var(--surface-chip-yellow)] text-[var(--text-strong)]">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">House Ledger</p>
                <p className="text-sm text-[var(--text-body)]">Site journal system</p>
              </div>
            </div>
            <h1 className="font-display mt-5 text-[2rem] font-extrabold leading-tight text-[var(--text-strong)]">
              Playful mobile finance UI, adapted for construction bookkeeping.
            </h1>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`focus-ring flex min-h-13 items-center gap-3 rounded-[22px] border-2 px-4 py-3 text-sm font-medium transition duration-200 ${
                    active
                      ? "border-[var(--border-strong)] bg-[var(--surface-chip-yellow)] text-[var(--text-strong)]"
                      : "border-transparent text-[var(--text-body)] hover:bg-[var(--surface-card-soft)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-[28px] border-2 border-[var(--border-subtle)] bg-[var(--surface-chip-lilac)] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Journal First</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              Ledgers, analytics, and outstanding balances are all derived from journal items and payments.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="panel overflow-hidden rounded-[36px] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Project workspace</p>
                <h2 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[var(--text-strong)] md:text-5xl">{title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">{description}</p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">{action}</div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[30px] border-2 border-[var(--border-subtle)] bg-[var(--surface-panel)] p-2 shadow-[0_20px_40px_rgba(83,64,37,0.16)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {links.slice(0, 4).map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-[22px] border-2 text-[11px] font-medium ${
                  active ? "border-[var(--border-subtle)] bg-[var(--surface-chip-yellow)] text-[var(--text-strong)]" : "border-transparent text-[var(--text-muted)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <Link className="flex-1" href="/reports">
            <AppButton className="w-full" tone="secondary">
              Reports
            </AppButton>
          </Link>
          <Link className="flex-1" href="/settings">
            <AppButton className="w-full" tone="secondary">
              More
            </AppButton>
          </Link>
        </div>
      </nav>
    </div>
  );
}
