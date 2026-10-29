import * as z from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(255),
  sku: z.string().trim().min(1, "SKU is required.").max(100),
  category_id: z.number().min(1, "Please select a category."),
  brand_id: z.number().min(1, "Please select a brand."),
  selling_price: z
    .union([z.string().trim().min(1, "Selling price is required."), z.number()])
    .refine(
      (value) => /^[+-]?(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(String(value)),
      "Enter a price with at most two decimal places.",
    )
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
      "Selling price must be at least 0.",
    ),
  stock_quantity: z
    .union([z.string().trim(), z.number()])
    .refine(
      (value) =>
        /^\+?\d+$/.test(String(value)) &&
        Number.isInteger(Number(value)) && Number(value) >= 0,
      "Enter a non-negative whole number.",
    )
    .optional(),
  type: z.enum(["in_stock", "pre_order"]).optional(),
  is_active: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
