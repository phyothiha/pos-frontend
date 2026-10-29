import * as z from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
  description: z.string(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
