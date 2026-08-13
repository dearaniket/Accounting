"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, Trash2, X } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useMemo, useState } from "react";

import { useAppData } from "@/components/providers/app-provider";
import { AppButton, Field, Surface, TextArea, TextInput } from "@/components/ui";
import { formatCurrency, formatCurrencyInput, getEntrySummary, parseMoneyInput } from "@/lib/finance";
import { EntryFormInput, JournalEntry } from "@/lib/types";
import { entryFormSchema } from "@/lib/validation";

async function compressImage(file: File) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(nextImage);
    };
    nextImage.onerror = reject;
    nextImage.src = objectUrl;
  });

  const canvas = document.createElement("canvas");
  const ratio = Math.min(1280 / image.width, 1280 / image.height, 1);
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  const context = canvas.getContext("2d");
  context?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function buildDefaults(entry?: JournalEntry): EntryFormInput {
  if (!entry) {
    const today = new Date().toISOString().slice(0, 10);
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
    attachments: entry.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      dataUrl: attachment.dataUrl,
    })),
  };
}

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
  const itemNames = useMemo(() => data.itemAccounts.map((account) => account.name), [data.itemAccounts]);
  const defaults = buildDefaults(entry);

  if (entry) {
    defaults.items = entry.items.map((item) => {
      const account = data.itemAccounts.find((candidate) => candidate.id === item.itemAccountId);

      return {
        id: item.id,
        itemName: account?.name || "",
        quantity: item.quantity || "",
        unit: item.unit || "",
        amount: formatCurrencyInput(item.amountPaise),
      };
    });
  }

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<EntryFormInput>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const itemValues = useWatch({ control, name: "items" }) ?? [];
  const attachments = useWatch({ control, name: "attachments" }) ?? [];
  const runningTotal = itemValues.reduce((sum, item) => sum + parseMoneyInput(item.amount), 0);

  const onSubmit = handleSubmit((values) => {
    saveEntry(values);
    onClose();
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-overlay)] px-3 py-3 sm:items-center">
      <Surface className="scrollbar-thin max-h-[94vh] w-full max-w-5xl overflow-y-auto p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{entry ? "Edit journal entry" : "New journal entry"}</p>
            <h3 className="mt-2 text-2xl font-bold text-[var(--text-strong)]">Fast entry, derived ledgers, clean payment tracking.</h3>
          </div>
          <AppButton aria-label="Close dialog" tone="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </AppButton>
        </div>

        <form className="mt-6 grid gap-6" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Date" error={errors.date?.message}>
              <TextInput type="date" {...register("date")} />
            </Field>
            <Field label="Particular" error={errors.particular?.message}>
              <TextInput placeholder="BridgeMohan Bill 3" {...register("particular")} />
            </Field>
          </div>

          <Surface muted className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-[var(--text-strong)]">Items</h4>
                <p className="text-sm text-[var(--text-muted)]">At least one item is required. Total updates instantly.</p>
              </div>
              <AppButton type="button" tone="secondary" onClick={() => append({ itemName: "", quantity: "", unit: "", amount: "" })}>
                <Plus className="mr-2 h-4 w-4" />
                Add item
              </AppButton>
            </div>

            <div className="mt-4 grid gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-[24px] border border-[var(--border-subtle)] bg-white/5 p-4">
                  <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    <Field label="Item / account" error={errors.items?.[index]?.itemName?.message}>
                      <TextInput list="item-accounts" placeholder="Cement" {...register(`items.${index}.itemName`)} />
                    </Field>
                    <Field label="Quantity">
                      <TextInput inputMode="decimal" placeholder="50" {...register(`items.${index}.quantity`)} />
                    </Field>
                    <Field label="Unit">
                      <TextInput placeholder="bags" {...register(`items.${index}.unit`)} />
                    </Field>
                    <Field label="Amount" error={errors.items?.[index]?.amount?.message}>
                      <TextInput inputMode="decimal" placeholder="15200" {...register(`items.${index}.amount`)} />
                    </Field>
                    <div className="flex items-end">
                      <AppButton type="button" tone="ghost" className="w-full" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </AppButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <datalist id="item-accounts">
              {itemNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Surface>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="grid gap-4">
              <Surface muted className="p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Amount paid">
                    <TextInput inputMode="decimal" placeholder="25000" {...register("amountPaid")} />
                  </Field>
                  <Field label="Payment date">
                    <TextInput type="date" {...register("paymentDate")} />
                  </Field>
                  <Field label="Payment note">
                    <TextInput placeholder="Advance / transfer note" {...register("paymentNote")} />
                  </Field>
                </div>
              </Surface>

              <Surface muted className="p-4 sm:p-5">
                <Field label="Notes">
                  <TextArea placeholder="Optional notes for follow-up, site work, or supplier details." {...register("notes")} />
                </Field>
              </Surface>

              <Surface muted className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-strong)]">Bill photo</h4>
                    <p className="text-sm text-[var(--text-muted)]">JPG, PNG, JPEG, and WebP are compressed before saving.</p>
                  </div>
                  <label className="focus-ring inline-flex min-h-11 items-center rounded-2xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-body)]">
                    <Camera className="mr-2 h-4 w-4" />
                    {uploading ? "Processing..." : "Attach bill"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }

                        setUploading(true);
                        const dataUrl = await compressImage(file);
                        setValue("attachments", [
                          ...attachments,
                          {
                            fileName: file.name,
                            mimeType: file.type,
                            size: file.size,
                            dataUrl,
                          },
                        ]);
                        setUploading(false);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {attachments.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {attachments.map((attachment, index) => (
                      <div key={`${attachment.fileName}-${index}`} className="overflow-hidden rounded-[24px] border border-[var(--border-subtle)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={attachment.fileName} className="aspect-[4/3] w-full object-cover" src={attachment.dataUrl} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </Surface>
            </div>

            <div className="grid gap-4">
              <Surface className="sticky top-4 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Running total</p>
                <p className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--text-strong)]">{formatCurrency(runningTotal)}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Calculated automatically from item amounts. No manual total field.</p>
                <div className="mt-6 grid gap-3">
                  <AppButton type="submit">Save entry</AppButton>
                  <AppButton type="button" tone="secondary" onClick={onClose}>
                    Cancel
                  </AppButton>
                </div>
              </Surface>
            </div>
          </div>
        </form>
      </Surface>
    </div>
  );
}
