import { z } from "zod";

export const invoiceFormSchema = z.object({
  invoice_date: z.iso.date("Enter a valid invoice date."),
  customer_name: z.string().trim().min(1, "Customer name is required.").max(150),
  customer_phone: z.string().trim().min(1, "Customer phone is required.").max(30),
  delivery_phone: z.string().trim().min(1, "Delivery phone is required.").max(30),
  delivery_address: z.string().trim().min(1, "Delivery address is required."),
  payment_type: z.enum(["paid", "cod"]),
  payment_platform_id: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative("Enter a non-negative whole amount."),
  delivery_fee: z.number().int().nonnegative("Enter a non-negative whole amount."),
  items: z.array(z.object({
    product_id: z.number().int().positive(),
    quantity: z.number().int().min(1, "Quantity must be at least 1."),
  })).min(1, "Add at least one product."),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const collectPaymentFormSchema = z.object({
  payment_platform_id: z.number().int().positive().nullable(),
});

export type CollectPaymentFormValues = z.infer<typeof collectPaymentFormSchema>;
