"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

import { useAppData } from "@/components/providers/app-provider";
import { AppButton, Field, Surface, TextInput } from "@/components/ui";
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      entryId,
      date: new Date().toISOString().slice(0, 10),
      amount: "",
      note: "",
    },
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-overlay)] px-3 py-3 sm:items-center">
      <Surface className="w-full max-w-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Payment entry</p>
            <h3 className="mt-2 text-2xl font-bold text-[var(--text-strong)]">Add payment history</h3>
          </div>
          <AppButton tone="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </AppButton>
        </div>

        <form
          className="mt-5 grid gap-4"
          onSubmit={handleSubmit((values) => {
            addPayment(values);
            onClose();
          })}
        >
          <input type="hidden" {...register("entryId")} />
          <Field label="Payment date" error={errors.date?.message}>
            <TextInput type="date" {...register("date")} />
          </Field>
          <Field label="Amount" error={errors.amount?.message}>
            <TextInput inputMode="decimal" placeholder="18200" {...register("amount")} />
          </Field>
          <Field label="Note">
            <TextInput placeholder="Transfer, cash, cheque, correction..." {...register("note")} />
          </Field>
          <div className="flex gap-3">
            <AppButton type="submit" className="flex-1">
              Save payment
            </AppButton>
            <AppButton type="button" tone="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </AppButton>
          </div>
        </form>
      </Surface>
    </div>
  );
}
