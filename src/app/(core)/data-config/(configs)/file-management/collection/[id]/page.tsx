"use client";

import PageTitle from "@/core/layouts/common/page-title";
import { GET_USER_COLLECTION_WITH_FILE_COUNT_QUERY } from "@/modules/graph/apollo/query/collection-file";
import { CollectionFileManagementTable } from "@/modules/graph/layouts/tables/collection-file-management";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";

export default function CollectionPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: collectionData,
    loading: collectionLoading,
    error: collectionError,
  } = useQuery(GET_USER_COLLECTION_WITH_FILE_COUNT_QUERY, {
    variables: { collectionId: id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const collection = collectionData?.getUserCollectionWithFileCountById;

  return (
    <div className="mx-auto px-4 py-6">
      <PageTitle
        title={collection?.title}
        description={collection ? `${collection.fileCount} Files` : undefined}
        backButton
        loading={collectionLoading}
        error={collectionError?.message}
      />

      <CollectionFileManagementTable collectionId={id} />
    </div>
  );
}
