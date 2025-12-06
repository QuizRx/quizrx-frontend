export type UploadedFile = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  filename: string;
  mimetype: string;
  url: string;
  path: string;
  size: number;
};

export type FilesResponse = {
  files: UploadedFile[];
  total: number;
};
