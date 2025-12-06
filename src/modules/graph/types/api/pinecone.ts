export type PineconeConnectionTestInput = {
  apiKey: string;
  environmentUri: string;
  indexName: string;
};

export type CreatePineconeConfigInput = {
  name: string;
  apiKey: string;
  environmentUri: string;
  indexName: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  embeddingApiKey: string;
};

export type UpdatePineconeConfigInput = Partial<CreatePineconeConfigInput>;

export type PineconeConfig = {
  _id: string;
  userId: string;
  name: string;
  apiKey: string;
  environmentUri: string;
  indexName: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  embeddingApiKey: string;
  createdAt: string;
  updatedAt: string;
};
