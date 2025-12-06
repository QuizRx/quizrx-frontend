import { Collection } from "./collection";

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
