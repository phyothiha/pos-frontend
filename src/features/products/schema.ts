import * as z from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(255),
  sku: z.string().trim().min(1, "SKU is required.").max(100),
  category_id: z.number().min(1, "Please select a category."),
  brand_id: z.number().min(1, "Please select a brand."),
  selling_price: z.number().int().min(0, "Selling price must be at least 0."),
  stock_quantity: z.number().int().min(0).optional(),
  type: z.enum(["in_stock", "pre_order"]).optional(),
  is_active: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
