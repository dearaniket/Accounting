"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useMemo, useState } from "react";

import { useAppData } from "@/components/providers/app-provider";
import { AppButton, Field, TextArea, TextInput } from "@/components/ui";
import { formatCurrency, formatCurrencyInput, getEntrySummary, parseMoneyInput } from "@/lib/finance";
import { EntryFormInput, JournalEntry } from "@/lib/types";
import { entryFormSchema } from "@/lib/validation";

async function compressImage(file: File): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1280 / image.width, 1280 / image.height, 1);
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function buildDefaults(entry?: JournalEntry): EntryFormInput {
  const today = new Date().toISOString().slice(0, 10);
  if (!entry) {
    return {
      date: today,
      particular: "",
      notes: "",
      amountPaid: "",
      paymentDate: today,
      paymentNote: "",
      items: [{ itemName: "", quantity: "", unit: "", amount: "" }],
      attachments: [],
    };
  }
  const summary = getEntrySummary(entry);
  return {
    id: entry.id,
    date: entry.date,
    particular: entry.particular,
    notes: entry.notes || "",
    amountPaid: entry.payments.length ? formatCurrencyInput(summary.paidPaise) : "",
    paymentDate: entry.payments[0]?.date || entry.date,
    paymentNote: entry.payments[0]?.note || "",
    items: entry.items.map((item) => ({
      id: item.id,
      itemName: "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      amount: formatCurrencyInput(item.amountPaise),
    })),
    attachments: entry.attachments.map((a) => ({
      id: a.id, fileName: a.fileName, mimeType: a.mimeType, size: a.size, dataUrl: a.dataUrl,
    })),
  };
}

/* ─── Section Header ─────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">{children}</p>
  );
}

/* ─── Entry Dialog ───────────────────────────────────────────────────── */
export function EntryDialog({
  entry,
  open,
  onClose,
}: {
  entry?: JournalEntry;
  open: boolean;
  onClose: () => void;
}) {
  const { data, saveEntry } = useAppData();
  const [uploading, setUploading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const itemNames = useMemo(() => data.itemAccounts.map((a) => a.name), [data.itemAccounts]);

  const defaults = useMemo(() => {
    const d = buildDefaults(entry);
    if (entry) {
      d.items = entry.items.map((item) => {
        const acc = data.itemAccounts.find((a) => a.id === item.itemAccountId);
        return {
          id: item.id,
          itemName: acc?.name || "",
          quantity: item.quantity || "",
          unit: item.unit || "",
          amount: formatCurrencyInput(item.amountPaise),
        };
      });
    }
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]);

  const {
    register, control, setValue, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormInput>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const itemValues  = useWatch({ control, name: "items" }) ?? [];
  const attachments = useWatch({ control, name: "attachments" }) ?? [];
  const runningTotal = itemValues.reduce((s, i) => s + parseMoneyInput(i.amount), 0);

  const onSubmit = handleSubmit((values) => {
    saveEntry(values);
    onClose();
  });

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
      style={{ background: "var(--overlay)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={entry ? "Edit journal entry" : "New journal entry"}
    >
      {/* Sheet */}
      <div
        className="scrollbar-thin flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-y-auto"
        style={{
          background: "rgba(10,10,15,0.96)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset",
          backdropFilter: "blur(32px)",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              {entry ? "Edit entry" : "New bill entry"}
            </p>
            <h3 className="font-display mt-1 text-2xl font-bold text-[var(--text-primary)]">
              {entry ? "Update this journal entry" : "Record a new expense"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition duration-150"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* ── Running Total Banner ────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: "linear-gradient(90deg, var(--accent-dim), transparent)", borderBottom: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Running total</p>
          <p className="font-display text-2xl font-bold text-[var(--text-primary)]" style={{ textShadow: "0 0 20px var(--accent-glow)" }}>
            {formatCurrency(runningTotal)}
          </p>
        </div>

        {/* ── Form ───────────────────────────────────────────────── */}
        <form className="flex flex-col gap-6 p-5" onSubmit={onSubmit} noValidate>

          {/* Date + Particular */}
          <div>
            <SectionTitle>Bill details</SectionTitle>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Date" error={errors.date?.message}>
                <TextInput type="date" {...register("date")} />
              </Field>
              <Field label="Bill / Particular" error={errors.particular?.message}>
                <TextInput placeholder="BridgeMohan Bill 8" {...register("particular")} />
              </Field>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between">
              <SectionTitle>Items ({fields.length})</SectionTitle>
              <button
                type="button"
                onClick={() => append({ itemName: "", quantity: "", unit: "", amount: "" })}
                className="focus-ring flex items-center gap-1.5 rounded-full bg-[var(--accent-dim)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] ring-1 ring-[var(--border-accent)] transition hover:bg-[var(--accent)] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add item
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-[var(--radius)] p-4"
                  style={{ background: "var(--bg-card-muted)", border: "1px solid var(--border)" }}
                >
                  {/* Item name */}
                  <div className="mb-3">
                    <Field label="Item / Material" error={errors.items?.[index]?.itemName?.message}>
                      <TextInput
                        list="item-accounts"
                        placeholder="Cement, Bricks, Labour…"
                        {...register(`items.${index}.itemName`)}
                      />
                    </Field>
                  </div>

                  {/* Qty + Unit + Amount */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                    <Field label="Qty">
                      <TextInput
                        inputMode="decimal"
                        placeholder="50"
                        {...register(`items.${index}.quantity`)}
                      />
                    </Field>
                    <Field label="Unit">
                      <TextInput placeholder="bags" {...register(`items.${index}.unit`)} />
                    </Field>
                    <Field label="Amount ₹" error={errors.items?.[index]?.amount?.message}>
                      <TextInput
                        inputMode="decimal"
                        placeholder="15200"
                        {...register(`items.${index}.amount`)}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label="Remove item"
                      className="focus-ring mb-0.5 flex h-[44px] w-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-faint)] transition hover:border-[var(--danger)] hover:bg-[var(--danger-dim)] hover:text-[var(--danger)] disabled:pointer-events-none disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <datalist id="item-accounts">
              {itemNames.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>

          {/* Payment */}
          <div>
            <SectionTitle>Payment (optional)</SectionTitle>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field label="Amount paid ₹">
                <TextInput inputMode="decimal" placeholder="25000" {...register("amountPaid")} />
              </Field>
              <Field label="Payment date">
                <TextInput type="date" {...register("paymentDate")} />
              </Field>
              <Field label="Payment note">
                <TextInput placeholder="Advance / UPI ref" {...register("paymentNote")} />
              </Field>
            </div>
          </div>

          {/* Optional: Notes + Photo (collapsed by default on mobile) */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              className="focus-ring flex w-full items-center justify-between rounded-[var(--radius-sm)] bg-[var(--bg-card-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] ring-1 ring-[var(--border)] transition hover:text-[var(--text-secondary)]"
            >
              Notes &amp; Bill photo (optional)
              {showOptional ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            </button>

            {showOptional && (
              <div className="mt-3 flex flex-col gap-4">
                <Field label="Notes">
                  <TextArea
                    placeholder="Site details, supplier info, follow-up…"
                    {...register("notes")}
                  />
                </Field>

                <div
                  className="rounded-[var(--radius)] p-4"
                  style={{ background: "var(--bg-card-muted)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Bill photo</p>
                      <p className="text-xs text-[var(--text-muted)]">JPG, PNG, WebP — auto-compressed.</p>
                    </div>
                    <label
                      className="focus-ring inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-card-hover)]"
                    >
                      <Camera className="h-4 w-4" aria-hidden />
                      {uploading ? "Processing…" : "Attach"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="sr-only"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          const dataUrl = await compressImage(file);
                          setValue("attachments", [
                            ...attachments,
                            { fileName: file.name, mimeType: file.type, size: file.size, dataUrl },
                          ]);
                          setUploading(false);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {attachments.map((a, i) => (
                        <div
                          key={`${a.fileName}-${i}`}
                          className="overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-[var(--border)]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.dataUrl} alt={a.fileName} className="aspect-[4/3] w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="grid gap-2 sm:grid-cols-2">
            <AppButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : entry ? "Update entry" : "Save entry"}
            </AppButton>
            <AppButton type="button" tone="ghost" onClick={onClose}>
              Cancel
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}
