import { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";

export const UPLOAD_MULTIPLE_FILES: TypedDocumentNode<
  { uploadMultipleFiles: string[] },
  { files: Array<File> }
> = gql`
  mutation UploadMultipleFiles($files: [Upload!]!) {
    uploadMultipleFiles(files: $files)
  }
`;

export const UPLOAD_FILE: TypedDocumentNode<
  { uploadFile: string },
  { file: File }
> = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file)
  }
`;

export const DELETE_FILE: TypedDocumentNode<
  { deleteFile: boolean },
  { fileId: string }
> = gql`
  mutation DeleteFile($fileId: String!) {
    deleteFile(fileId: $fileId)
  }
`;
