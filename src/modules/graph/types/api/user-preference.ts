import { Model,EmbeddingModel } from "@/modules/graph/types/api/enum";

export type UserPreference = {
  _id: string;
  userId: string;
  modelName: string;
  apiKey: string;
  embeddingModel: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserPreferenceInput = {
  modelName: Model;
  apiKey: string;
  embeddingModel: EmbeddingModel;
}

export type OpenAIConnectionTestInput = {
  apiKey: string;
};
