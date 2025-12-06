"use client";

import { DataTable } from "@/core/components/table/data-table";
import { TableTitleHeader } from "@/core/components/table/title-header";
import { toast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_COLLECTION_FILES } from "../../apollo/query/collection-file";
import { collectionFileColumns } from "../../components/columns/collection-file";
import { UploadedFile } from "../../types/api/uploaded-file";

export const CollectionFileManagementTable = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const [filesData, setFilesData] = useState<UploadedFile[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_COLLECTION_FILES, {
    variables: { collectionId },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getFilesByCollection?.data) {
      console.log(data.getFilesByCollection.data);
      setFilesData(data.getFilesByCollection.data);
    }
    if (error) {
      const customError = extractCustomError(error);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [data, error]);

  return (
    <div className="mt-8">
      <DataTable
        columns={collectionFileColumns(collectionId)}
        data={filesData}
        isLoading={loading}
        error={error?.message}
        header={
          <TableTitleHeader
            title={`Attached Files`}
            description="Here you can explore your uploaded files"
            onSearchTextChange={() => {}}
            onFilterChange={() => {}}
          />
        }
      />
    </div>
  );
};
