export type Collection = {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type AddFileToCollectionInput = {
  fileId: string;
  collectionId: string;
};

export type CollectionFile = BaseEntityProps & {
  fileId: string;
  collectionId: string;
};

export type CollectionWithFileCount = Collection & {
  fileCount: number;
};
