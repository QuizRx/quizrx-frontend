"use client";

import { useApolloClient, useMutation } from "@apollo/client";
import { DELETE_PINECONE_CONFIG } from "@/modules/graph/apollo/mutation/pinecone";
import { GET_USER_PINECONE_CONFIGS } from "@/modules/graph/apollo/query/pinecone";
import PineconeConfigForm from "@/modules/graph/layouts/forms/pinecone";
import { PineconeConfig } from "@/modules/graph/types/api/pinecone";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Eye, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useToast } from "@/core/hooks/use-toast";

export const pineconeConfigColumns: ColumnDef<PineconeConfig>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Configuration</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium flex gap-2">
          {row.original.name}{" "}
          <div className="w-2 h-2 my-auto z-50 bg-purple-600 rounded-full flex flex-col items-center justify-center">
            <div className="h-2.5 w-2.5 bg-purple-700 animate-ping rounded-full" />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "environmentUri",
    header: () => <div className="text-left">Environment</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          {row.original.environmentUri}
        </div>
      );
    },
  },
  {
    accessorKey: "indexName",
    header: () => <div className="text-left">Index Name</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.original.indexName}</div>
      );
    },
  },
  {
    accessorKey: "chunkSize",
    header: () => <div className="text-left">Chunk Size</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.original.chunkSize}</div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      return <PineconeConfigActions row={row} />;
    },
  },
];

const PineconeConfigActions = ({ row }: { row: Row<any> }) => {
  const { toast } = useToast();
  const client = useApolloClient();
  const [deletePineconeConfig, { loading }] = useMutation(
    DELETE_PINECONE_CONFIG
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleViewConfig = () => {
    setViewModalOpen(true);
  };

  const handleEditConfig = () => {
    setEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setEditModalOpen(false);
    toast({
      title: "Success",
      description: "Configuration updated successfully",
    });
    client.refetchQueries({
      include: [GET_USER_PINECONE_CONFIGS],
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-2 w-2" size={"sm"}>
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-2 w-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleViewConfig}>
            <Eye className="h-4 w-4 mr-2 text-blue-500" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditConfig}>
            <Edit className="h-4 w-4 mr-2 text-green-500" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              deletePineconeConfig({
                variables: {
                  deletePineconeConfigId: row.original._id,
                },
                onCompleted: () => {
                  toast({
                    title: "Success",
                    description: "Configuration deleted successfully",
                  });
                  client.refetchQueries({
                    include: [GET_USER_PINECONE_CONFIGS],
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
            <Trash className="h-4 w-4 mr-2 text-red-500" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-[50rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Pinecone Configuration</DialogTitle>
          </DialogHeader>
          <PineconeConfigForm initialData={row.original} isViewMode={true} />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-[50rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pinecone Configuration</DialogTitle>
          </DialogHeader>
          <PineconeConfigForm
            initialData={row.original}
            isViewMode={false}
            onUpdate={handleUpdateSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
