"use client";

import { DataTable } from "@/core/components/table/data-table";
import { TableTitleHeader } from "@/core/components/table/title-header";
import { toast } from "@/core/hooks/use-toast";
import extractCustomError from "@/core/utils/extract-custom-error";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_USER_FILES } from "../../apollo/query/file-management";
import { uploadedFileColumns } from "../../components/columns/uploaded-file";
import { UploadedFile } from "../../types/api/uploaded-file";


export const FileManagementTable = () => {
  const [filesData, setFilesData] = useState<UploadedFile[]>([]);

  const { data, loading, error } = useQuery(GET_USER_FILES, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getUserFiles?.data) {
      console.log(data.getUserFiles.data);
      setFilesData(data.getUserFiles.data);
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
        columns={uploadedFileColumns}
        data={filesData}
        isLoading={loading}
        error={error?.message}
        header={
          <TableTitleHeader
            title="Attached Files"
            description="Here you can explore your uploaded files"
            onSearchTextChange={() => {}}
            onFilterChange={() => {}}
          />
        }
      />
    </div>
  );
};
