import { DataStoreType } from "@/core/types/common/enum";
import { createGenericStore } from "./generic.store";

export const useDataStoreType = createGenericStore<DataStoreType>(
  "GCP",
  "api-integration"
);
