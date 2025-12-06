import { BaseEntityProps } from "@/core/types/api/api";
import { UploadedFile } from "@/modules/graph/types/api/uploaded-file";

export enum EmbeddingStatus {
  NOT_EMBEDDED = "NOT_EMBEDDED",
  EMBEDDED = "EMBEDDED",
}

export type FileWithEmbedding = UploadedFile & {
  embeddingStatus: EmbeddingStatus;
};

export type EmbedFileInput = {
  fileId: string;
  pineconeConfigId: string;
};

export type FileEmbedding = BaseEntityProps & {
  fileId: string;
  status: EmbeddingStatus;
};
