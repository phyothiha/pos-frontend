import * as z from "zod";

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required."),
  description: z.string(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
