import { z } from "zod";

const remoteDataStoreSchema = z.object({
  selectedCard: z.string().min(1, { message: "Please select a card." }),
});

type RemoteDataStoreFormValues = z.infer<typeof remoteDataStoreSchema>;
export { remoteDataStoreSchema, type RemoteDataStoreFormValues };
