"use client";

import { useMutation, useApolloClient } from "@apollo/client";
import { DELETE_FILE } from "@/modules/graph/apollo/mutation/file-management";
import { GET_USER_FILES } from "@/modules/graph/apollo/query/file-management";
import { UploadedFile } from "@/modules/graph/types/api/uploaded-file";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreVertical, Trash, Plus } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useToast } from "@/core/hooks/use-toast";
import { useState } from "react";
import { AddFileToCollectionDialog } from "../../layouts/forms/add-file-to-collection";

export const uploadedFileColumns: ColumnDef<UploadedFile>[] = [
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
      // Format file size to appropriate units (B, KB, MB, GB)
      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        else if (bytes < 1024 * 1024 * 1024)
          return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
      };
      return (
        <div className="text-left">{formatFileSize(row.original.size)}</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left">Created At</div>,
    cell: ({ row }) => {
      // Format ISO date string to a readable format
      const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      };
      return (
        <div className="text-left">{formatDate(row.original.createdAt)}</div>
      );
    },
  },
  {
    accessorKey: "mimetype",
    header: () => <div className="text-left">Type</div>,
    cell: ({ row }) => <div className="text-left">{row.original.mimetype}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      return <UploadedFileActions row={row} />;
    },
  },
];

const UploadedFileActions = ({ row }: { row: Row<any> }) => {
  const { toast } = useToast();
  const client = useApolloClient();
  const [deleteFile] = useMutation(DELETE_FILE);

    const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-2 w-2" size={"sm"}>
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-2 w-2 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            deleteFile({
              variables: {
                fileId: row.original._id,
              },
              onCompleted: () => {
                toast({
                  title: "Success",
                  description: "File deleted successfully",
                });
                client.refetchQueries({
                  include: [GET_USER_FILES],
                });
              },
              onError: (error) => {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: error.message,
                });
              },
            });
          }}
        >
          <Trash className="text-red-500" />
          Delete
        </DropdownMenuItem>
             <DropdownMenuItem
          onClick={() => {
            setIsAddFileDialogOpen(true);
          }}
        >
          <Plus className="text-green-500" />
          Add to Collection
        </DropdownMenuItem>
        {/* <DropdownMenuSeparator /> */}
      </DropdownMenuContent>
            <AddFileToCollectionDialog
        fileId={row.original._id}
        isOpen={isAddFileDialogOpen}
        onClose={() => {
          setIsAddFileDialogOpen(false);
        }}
        onSuccess={() => {
          setIsAddFileDialogOpen(false);
        }}
      />
    </DropdownMenu>
  );
};
