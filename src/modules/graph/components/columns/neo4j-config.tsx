"use client";

import { useApolloClient, useMutation } from "@apollo/client";
import { DELETE_NEO4J_CONFIG } from "@/modules/graph/apollo/mutation/neo4j";
import { GET_USER_NEO4J_CONFIGS } from "@/modules/graph/apollo/query/neo4j";
import Neo4jConfigForm from "@/modules/graph/layouts/forms/neo4j";
import { Neo4jConfig } from "@/modules/graph/types/api/neo4j";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreVertical, Trash, Eye, Edit } from "lucide-react";
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

export const neo4jConfigColumns: ColumnDef<Neo4jConfig>[] = [
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
    accessorKey: "username",
    header: () => <div className="text-left">User Name</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.original.username}</div>
      );
    },
  },
  {
    accessorKey: "uri",
    header: () => <div className="text-left">Uri</div>,
    cell: ({ row }) => {
      return <div className="text-left font-medium">{row.original.uri}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      return <Neo4jConfigActions row={row} />;
    },
  },
];

const Neo4jConfigActions = ({ row }: { row: Row<any> }) => {
  const { toast } = useToast();
  const client = useApolloClient();
  const [deleteNeo4jConfig, { loading }] = useMutation(DELETE_NEO4J_CONFIG);

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
      include: [GET_USER_NEO4J_CONFIGS],
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
              deleteNeo4jConfig({
                variables: {
                  deleteNeo4JConfigId: row.original._id,
                },
                onCompleted: () => {
                  toast({
                    title: "Success",
                    description: "Configuration deleted successfully",
                  });
                  client.refetchQueries({
                    include: [GET_USER_NEO4J_CONFIGS],
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
            <DialogTitle>View Neo4j Configuration</DialogTitle>
          </DialogHeader>
          <Neo4jConfigForm initialData={row.original} isViewMode={true} />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-[50rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Neo4j Configuration</DialogTitle>
          </DialogHeader>
          <Neo4jConfigForm
            initialData={row.original}
            isViewMode={false}
            onUpdate={handleUpdateSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
