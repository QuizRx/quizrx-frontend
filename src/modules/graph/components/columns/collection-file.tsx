// components/columns/collection-file-columns.tsx
"use client";

import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useToast } from "@/core/hooks/use-toast";
import { refetchQueries } from "@/core/providers/apollo-wrapper";
import { DELETE_FILE } from "@/modules/graph/apollo/mutation/file-management";
import { GET_USER_FILES } from "@/modules/graph/apollo/query/file-management";
import {
  GET_COLLECTION_FILES,
  GET_USER_COLLECTION_WITH_FILE_COUNT_QUERY,
  GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY,
} from "@/modules/graph/apollo/query/collection-file";
import { REMOVE_FILE_FROM_COLLECTION_MUTATION } from "@/modules/graph/apollo/mutation/collection-file";
import { UploadedFile } from "@/modules/graph/types/api/uploaded-file";
import { useMutation } from "@apollo/client";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreVertical, Trash } from "lucide-react";
import { formatFileSize } from "@/core/utils/format-file-size";

export const collectionFileColumns = (
  collectionId: string
): ColumnDef<UploadedFile>[] => {
  return [
    {
      accessorKey: "filename",
      header: () => <div className="text-left">Name</div>,
      cell: ({ row }) => {
        return (
          <div className="text-left font-medium">{row.original.filename}</div>
        );
      },
    },
    {
      accessorKey: "size",
      header: () => <div className="text-left">Size</div>,
      cell: ({ row }) => {
        return (
          <div className="text-left">{formatFileSize(row.original.size)}</div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-left">Created At</div>,
      cell: ({ row }) => {
        return (
          <div className="text-left">
            {format(new Date(row.original.createdAt), "do MMMM, yyyy")}
          </div>
        );
      },
    },
    {
      accessorKey: "mimetype",
      header: () => <div className="text-left">Type</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.original.mimetype}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        return <CollectionFileActions row={row} collectionId={collectionId} />;
      },
    },
  ];
};

const CollectionFileActions = ({
  row,
  collectionId,
}: {
  row: Row<UploadedFile>;
  collectionId: string;
}) => {
  const { toast } = useToast();
  const [removeFileFromCollection] = useMutation(
    REMOVE_FILE_FROM_COLLECTION_MUTATION
  );
  const [deleteFile] = useMutation(DELETE_FILE);

  const handleRemoveFromCollection = () => {
    removeFileFromCollection({
      variables: {
        collectionId,
        fileId: row.original._id,
      },
      onCompleted: () => {
        toast({
          title: "Success",
          description: "File removed from collection successfully",
        });
        refetchQueries([
          GET_COLLECTION_FILES,
          GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY,
          GET_USER_COLLECTION_WITH_FILE_COUNT_QUERY,
          GET_USER_FILES,
        ]);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  const handleDeleteFile = () => {
    deleteFile({
      variables: {
        fileId: row.original._id,
      },
      onCompleted: () => {
        toast({
          title: "Success",
          description: "File deleted successfully",
        });
        refetchQueries([
          GET_COLLECTION_FILES,
          GET_USER_COLLECTIONS_WITH_FILE_COUNT_QUERY,
          GET_USER_COLLECTION_WITH_FILE_COUNT_QUERY,
          GET_USER_FILES,
        ]);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" size="sm">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleRemoveFromCollection}>
          <Trash className="mr-2 h-4 w-4" />
          Remove from Collection
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteFile}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
