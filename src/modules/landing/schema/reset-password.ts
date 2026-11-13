import { z } from "zod";

const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .refine((value) => /[a-z]/.test(value), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((value) => /\d/.test(value), {
        message: "Password must contain at least one number",
      })
      .refine((value) => /[@$!%*?&.^#]/.test(value), {
        message: "Password must contain at least one special character",
      })
      .refine((value) => /.{8,}/.test(value), {
        message: "Password must be at least 8 characters",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export { resetPasswordFormSchema, type ResetPasswordFormValues };
