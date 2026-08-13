"use client";

import { AppShell } from "@/components/app-shell";
import { useAppData } from "@/components/providers/app-provider";
import { AppButton, Surface, ToggleSwitch } from "@/components/ui";

export function SettingsView() {
  const { darkMode, fakeDataEnabled, resetDemoData, setDarkMode, setFakeDataEnabled } = useAppData();

  return (
    <AppShell
      title="Settings"
      description="Theme and sample-data controls styled to match the playful mobile wallet reference while keeping the bookkeeping workflow intact."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Surface className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Preferences</p>
          <h3 className="font-display mt-2 text-3xl font-extrabold text-[var(--text-strong)]">Interface toggles</h3>
          <div className="mt-5 grid gap-4">
            <ToggleSwitch
              checked={fakeDataEnabled}
              onChange={setFakeDataEnabled}
              label="Fake data"
              description="Turn demo construction entries on or off. Turning it off switches to a clean project dataset."
            />
            <ToggleSwitch
              checked={darkMode}
              onChange={setDarkMode}
              label="Dark mode"
              description="Switch the whole app between the pastel light wallet theme and its dark companion."
            />
          </div>
          <AppButton className="mt-5" tone="secondary" onClick={resetDemoData}>
            Reload sample entries
          </AppButton>
        </Surface>

        <Surface className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Design system</p>
          <h3 className="font-display mt-2 text-3xl font-extrabold text-[var(--text-strong)]">Applied UI direction</h3>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--text-body)]">
            <li>Rounded wallet-style cards with thick outlines and soft pastel accents</li>
            <li>Mobile-first hierarchy inspired by your payment-app reference image</li>
            <li>Consistent black linework, large touch targets, and simple bold labels</li>
            <li>Dark mode paired intentionally instead of being a quick inverted palette</li>
          </ul>
        </Surface>
      </div>
    </AppShell>
  );
}
