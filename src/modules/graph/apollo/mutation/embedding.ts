import { gql, TypedDocumentNode } from "@apollo/client";
import { EmbedFileInput, FileEmbedding } from "../../types/api/embedding";

export const EMBED_FILE_MUTATION: TypedDocumentNode<
  {
    embedFile: FileEmbedding;
  },
  { embedFileInput: EmbedFileInput }
> = gql`
  mutation EmbedFile($embedFileInput: EmbedFileInput!) {
    embedFile(embedFileInput: $embedFileInput) {
      _id
      createdAt
      fileId
      status
      updatedAt
    }
  }
`;
