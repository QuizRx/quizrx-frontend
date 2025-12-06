import { z } from "zod";
const connectionDetailFormSchema = z.object({
  connectionName: z.string().min(1, {
    message: "Connection Name is required.",
  }),
  isDestination: z.boolean().default(false),
  isSource: z.boolean().default(true),
  serviceAccountApiKey: z
    .string()
    .min(10, {
      message: "API Key must be at least 10 characters.",
    })
    .max(160, {
      message: "API Key must not be longer than 160 characters.",
    }),
});

type ConnectionDetailFormType = z.infer<typeof connectionDetailFormSchema>;
export { type ConnectionDetailFormType, connectionDetailFormSchema };
