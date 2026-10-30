import * as z from "zod";

export const loginFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .max(255, "Username must not exceed 255 characters."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(255, "Password must not exceed 255 characters."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
