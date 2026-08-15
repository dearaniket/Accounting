"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";

import { useAppData } from "@/components/providers/app-provider";
import { AppButton, Field, TextInput } from "@/components/ui";
import { PaymentInput } from "@/lib/types";
import { paymentFormSchema } from "@/lib/validation";

export function PaymentDialog({
  entryId,
  open,
  onClose,
}: {
  entryId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { addPayment } = useAppData();
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentInput>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      entryId,
      date: new Date().toISOString().slice(0, 10),
      amount: "",
      note: "",
    },
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
      style={{ background: "var(--overlay)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Add payment"
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-xl)] p-6"
        style={{
          background: "rgba(10,10,15,0.96)",
          border: "1px solid var(--border-strong)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
          backdropFilter: "blur(32px)",
        }}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]"
              style={{ background: "var(--success-dim)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <CreditCard className="h-5 w-5 text-[var(--success)]" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--success)]">Payment entry</p>
              <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">Record a payment</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition duration-150"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((values) => {
            addPayment(values);
            onClose();
          })}
        >
          <input type="hidden" {...register("entryId")} />
          <Field label="Payment date" error={errors.date?.message}>
            <TextInput type="date" {...register("date")} />
          </Field>
          <Field label="Amount ₹" error={errors.amount?.message}>
            <TextInput inputMode="decimal" placeholder="18200" {...register("amount")} />
          </Field>
          <Field label="Note (optional)">
            <TextInput placeholder="Cash / UPI / Transfer ref…" {...register("note")} />
          </Field>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <AppButton type="submit">Save payment</AppButton>
            <AppButton type="button" tone="ghost" onClick={onClose}>Cancel</AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}
