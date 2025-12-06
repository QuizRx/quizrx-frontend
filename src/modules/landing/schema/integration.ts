import { z } from "zod";

const integrationSchema = z.object({
  selectedCard: z.number().min(1, { message: "Please select a card." }),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;
export { type IntegrationFormValues, integrationSchema };
