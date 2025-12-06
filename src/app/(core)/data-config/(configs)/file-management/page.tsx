"use client";

import { useQuery, useApolloClient } from "@apollo/client";
import { GET_USER_FILES } from "@/modules/graph/apollo/query/file-management";
import { UploadedFile } from "@/modules/graph/types/api/uploaded-file";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import PageTitle from "@/core/components/shared/page-title";
import { DataTable } from "@/core/components/table/data-table";
import { Button } from "@/core/components/ui/button";
import FileCard from "@/core/components/ui/file-card";
import FileUpload from "@/core/components/ui/file-upload";
import { useAuth } from "@/core/providers/auth";

import { CollectionCards } from "@/modules/graph/layouts/data-config/collection-cards";
import { TableTitleHeader } from "@/core/components/table/title-header";
import extractCustomError from "@/core/utils/extract-custom-error";
import { uploadedFileColumns } from "@/modules/graph/components/columns/uploaded-file";
import { toast } from "@/core/hooks/use-toast";

export default function FileManagementPage() {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuth();
  const client = useApolloClient();

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

  const handleFileChange = (files: File[]) => {
    // Add new files to existing pending files instead of replacing them
    setPendingFiles((prevFiles) => {
      // Create a set of existing filenames to avoid duplicates
      const existingFilenames = new Set(prevFiles.map((file) => file.name));

      // Filter out files that are already in the list
      const newUniqueFiles = files.filter(
        (file) => !existingFilenames.has(file.name)
      );

      return [...prevFiles, ...newUniqueFiles];
    });
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...pendingFiles];
    updatedFiles.splice(index, 1);
    setPendingFiles(updatedFiles);
  };

  // Refetch all queries - could be used after file upload
  const refetchAllData = () => {
    client.refetchQueries({
      include: "all",
    });
  };

  // Function that matches the NestJS controller implementation
  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Get token from auth context instead of directly from cookies
      // This ensures consistency with how we handle authentication elsewhere
      if (!token) {
        throw new Error("Authentication token not found");
      }
      // Looking at your NestJS controller code, it expects:
      // 1. Files in the 'files' field using FilesInterceptor('files', 10, {...})
      // 2. userId in the request body using @Body('userId')
      const formData = new FormData();

      // Add each file with the field name 'files'
      pendingFiles.forEach((file) => {
        formData.append("files", file);
      });

      console.log("Attempting upload with userId and files...");

      // Make the request
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/files/upload/multiple",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Parse the response
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.log("Non-JSON response:", text);
        result = { message: text };
      }

      console.log("Upload response status:", response.status);
      console.log("Upload response:", result);

      if (!response.ok) {
        // Handle the specific error format returned by your API
        if (result.status === "ERROR") {
          throw new Error(
            result.cause || result.message || "Failed to process request"
          );
        } else {
          throw new Error(
            result.error ||
              result.message ||
              `Failed to upload files (Status: ${response.status})`
          );
        }
      }

      toast({
        title: "Success",
        description: `${pendingFiles.length} file(s) uploaded successfully!`,
      });

      // Reset files after successful upload
      setPendingFiles([]);

      // Refresh the files list using Apollo Client directly
      refetchAllData();
    } catch (error) {
      console.error("Upload error details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload files",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto px-4 py-6 bg-transparent">
      <PageTitle
        title={"File Management"}
        description={"Upload a Reference Data (Optional)"}
      />

      <FileUpload
        onChange={handleFileChange}
        name="file"
        isMultiple
        maxFileSize={50}
      />

 <CollectionCards />
      {pendingFiles.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingFiles.map((file, index) => (
              <FileCard
                key={file.name + index}
                file={file}
                onRemove={() => handleRemoveFile(index)}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      )}

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
}
