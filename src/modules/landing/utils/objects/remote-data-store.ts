import { DataStoreType } from "@/core/types/common/enum";

export const remoteDataStore: {
  name: string;
  icon: string;
  dataStore: DataStoreType;
}[] = [
  {
    name: "Google Cloud Storage",
    icon: "/logo/google-cloud-storage.svg",
    dataStore: "GCP",
  },
  {
    name: "Amazon S3",
    icon: "/logo/amazon-s3.svg",
    dataStore: "AWSS3",
  },
];
