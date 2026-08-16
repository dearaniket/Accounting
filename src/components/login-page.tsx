"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { checkCredentials } from "@/components/providers/auth-provider";

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Small artificial delay for UX (feels more secure)
    await new Promise((r) => setTimeout(r, 600));

    if (checkCredentials(username, password)) {
      onLogin();
    } else {
      setLoading(false);
      setError("Incorrect username or password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
    }
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center px-4"
      style={{
        background: "var(--bg-void)",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.14), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(16,185,129,0.05), transparent)",
      }}
    >
      <div
        className={[
          "w-full max-w-sm transition-transform",
          shake ? "animate-shake" : "",
        ].join(" ")}
      >
        {/* Card */}
        <div
          className="glass rounded-[var(--radius-xl)] p-8"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-[18px] text-white"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #818CF8 100%)",
                boxShadow: "0 0 32px var(--accent-glow)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">House Ledger</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Construction expense journal</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]"
              >
                Username
              </label>
              <input
                ref={usernameRef}
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter username"
                required
                className="focus-ring w-full rounded-[var(--radius-sm)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                style={{
                  background: "var(--bg-card-muted)",
                  border: "1px solid var(--border)",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter password"
                  required
                  className="focus-ring w-full rounded-[var(--radius-sm)] px-4 py-3 pr-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
                  style={{
                    background: "var(--bg-card-muted)",
                    border: "1px solid var(--border)",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)]"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm"
                style={{ background: "var(--danger-dim)", border: "1px solid rgba(244,63,94,0.3)", color: "var(--danger)" }}
                role="alert"
                aria-live="polite"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="glow-btn focus-ring mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              style={{ background: "var(--accent)" }}
            >
              {loading ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" aria-hidden />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px] text-[var(--text-faint)]">
            Private — your data stays on this device
          </p>
        </div>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
}
