import { z } from "zod";

const signUpFormSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
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
  });
  
  type SignUpFormValues = z.infer<typeof signUpFormSchema>;

  export { signUpFormSchema, type SignUpFormValues };