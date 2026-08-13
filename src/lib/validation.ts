import { z } from "zod";

export const entryFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  particular: z.string().min(1, "Particular is required"),
  notes: z.string().optional(),
  amountPaid: z.string().optional(),
  paymentDate: z.string().optional(),
  paymentNote: z.string().optional(),
  attachments: z.array(
    z.object({
      id: z.string().optional(),
      fileName: z.string(),
      mimeType: z.string(),
      size: z.number(),
      dataUrl: z.string(),
    }),
  ),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        itemName: z.string().min(1, "Item is required"),
        quantity: z.string().optional(),
        unit: z.string().optional(),
        amount: z.string().min(1, "Amount is required"),
      }),
    )
    .min(1, "At least one item is required"),
});

export const paymentFormSchema = z.object({
  entryId: z.string().min(1),
  date: z.string().min(1, "Payment date is required"),
  amount: z.string().min(1, "Payment amount is required"),
  note: z.string().optional(),
});
