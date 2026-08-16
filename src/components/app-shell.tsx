"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, BookOpenText, FolderKanban,
  LayoutDashboard, LogOut, ScrollText, Settings,
} from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/components/providers/auth-provider";

const links = [
  { href: "/",          label: "Overview",  icon: LayoutDashboard },
  { href: "/journal",   label: "Journal",   icon: BookOpenText },
  { href: "/ledgers",   label: "Ledgers",   icon: FolderKanban },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports",   label: "Reports",   icon: ScrollText },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

function resolveLabel(pathname: string) {
  const match = links.find((l) =>
    l.href === "/" ? pathname === "/" : pathname.startsWith(l.href),
  );
  return match ?? links[0];
}

/* ─── App Shell ─────────────────────────────────────────────────────── */
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
  const currentPage = resolveLabel(pathname);
  const CurrentIcon = currentPage.icon;
  const { logout } = useAuth();

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-[1600px] gap-5 px-4 pb-32 pt-4 lg:px-6 lg:pb-8">

        {/* ── Desktop Sidebar ───────────────────────────────────────── */}
        <aside className="hidden w-[256px] shrink-0 lg:flex lg:flex-col">
          <div className="sticky top-4 flex flex-col gap-3">

            {/* Glass nav panel */}
            <div className="glass flex flex-col rounded-[var(--radius-xl)] p-4">

              {/* Logo */}
              <div className="mb-5 flex items-center gap-3 px-1">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, #818CF8 100%)",
                    boxShadow: "0 0 16px var(--accent-glow)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
                <div>
                  <p className="font-display text-sm font-bold leading-tight text-[var(--text-primary)]">House Ledger</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Construction journal</p>
                </div>
              </div>

              {/* ── Current page indicator ── */}
              <div
                className="mb-4 flex items-center gap-3 rounded-[14px] px-3 py-2.5"
                style={{
                  background: "linear-gradient(90deg, var(--accent-dim), transparent)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent-glow)" }}
                >
                  <CurrentIcon className="h-4 w-4 text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">You are here</p>
                  <p className="font-display text-sm font-bold text-[var(--text-primary)]">{currentPage.label}</p>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1" aria-label="Main navigation">
                {links.map((link) => {
                  const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "focus-ring group flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-semibold transition duration-200",
                        active
                          ? "page-active-bar bg-[var(--accent)] pl-5 text-white"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-[17px] w-[17px] shrink-0",
                          active ? "text-white" : "text-[var(--text-faint)] group-hover:text-[var(--accent)]",
                        ].join(" ")}
                        aria-hidden
                      />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Tip card */}
            <div
              className="rounded-[var(--radius-lg)] p-4"
              style={{
                background: "linear-gradient(135deg, var(--accent-dim), rgba(99,102,241,0.04))",
                border: "1px solid var(--border-accent)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Journal First</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                Ledgers, charts, and outstanding dues are all derived automatically from your entries.
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="focus-ring flex w-full items-center gap-2.5 rounded-[var(--radius-lg)] px-4 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--danger-dim)] hover:text-[var(--danger)]"
              style={{ border: "1px solid var(--border)" }}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">

          {/* Page header */}
          <header className="glass overflow-hidden rounded-[var(--radius-xl)] px-6 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                {/* Breadcrumb / location */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-[6px]"
                    style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)" }}
                  >
                    <CurrentIcon className="h-3 w-3 text-white" aria-hidden />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                    {currentPage.label}
                  </p>
                </div>
                <h2
                  className="font-display mt-2 text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl"
                  style={{ textShadow: "0 0 40px rgba(99,102,241,0.18)" }}
                >
                  {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>
              </div>
              {action && (
                <div className="flex shrink-0 items-center gap-3 self-start md:self-auto">{action}</div>
              )}
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation ──────────────────────────────── */}
      <nav
        className="fixed inset-x-3 bottom-3 z-40 rounded-[var(--radius-xl)] lg:hidden"
        style={{
          background: "rgba(8,8,14,0.92)",
          border: "1px solid var(--border-strong)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
        aria-label="Mobile navigation"
      >
        {/* Current page banner */}
        <div
          className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2"
          style={{ background: "linear-gradient(90deg, var(--accent-dim), transparent)" }}
        >
          <CurrentIcon className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
            {currentPage.label}
          </p>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" style={{ boxShadow: "0 0 6px var(--accent)" }} />
        </div>

        {/* Nav grid */}
        <div className="grid grid-cols-6 gap-0.5 p-2">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "focus-ring flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[12px] text-[9px] font-bold uppercase tracking-wide transition duration-150",
                  active
                    ? "bg-[var(--accent-dim)] text-[var(--accent)] ring-1 ring-[var(--accent)]/40"
                    : "text-[var(--text-faint)] hover:text-[var(--text-muted)]",
                ].join(" ")}
              >
                <Icon className={["h-4 w-4", active ? "text-[var(--accent)]" : ""].join(" ")} aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
