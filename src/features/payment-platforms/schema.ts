import * as z from "zod";

export const paymentPlatformFormSchema = z.object({
  name: z.string().trim().min(1, "Platform name is required.").max(100),
});

export type PaymentPlatformFormValues = z.infer<typeof paymentPlatformFormSchema>;
