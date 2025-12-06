"use client";

import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useToast } from "@/core/hooks/use-toast";
import { useApolloClient, useMutation } from "@apollo/client";
import { ColumnDef, Row } from "@tanstack/react-table";
import moment from "moment";
import { Edit, Eye, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DELETE_PIPELINE_MUTATION } from "../../apollo/mutation/pipeline";
import { GET_USER_PIPELINES_QUERY } from "../../apollo/query/pipeline";
import PipelineDialogForm from "../../layouts/forms/pipeline";
import { Pipeline } from "../../types/api/pipeline";
import { refetchQueries } from "@/core/providers/apollo-wrapper";

export const pipelineColumns: ColumnDef<Pipeline>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium flex gap-2">
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left">Date Created</div>,
    cell: ({ row }) => {
      return (
        <div className={`text-left font-medium`}>
          {moment(row.original.createdAt).format("do MMMM, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "template",
    header: () => <div className="text-left">Template</div>,
    cell: ({ row }) => {
      return <div className="text-left font-medium">None</div>;
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
  const [deletePipeline, { loading }] = useMutation(DELETE_PIPELINE_MUTATION);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEditConfig = () => {
    setEditModalOpen(true);
  };

  const { push } = useRouter();
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
          <DropdownMenuItem
            onClick={() => {
              push("/concepts/canvas/" + row.original._id);
            }}
          >
            <Eye className="h-4 w-4 mr-2 text-blue-500" />
            Open Pipeline
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditConfig}>
            <Edit className="h-4 w-4 mr-2 text-green-500" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              deletePipeline({
                variables: {
                  deletePipelineId: row.original._id,
                },
                onCompleted: () => {
                  toast({
                    title: "Success",
                    description: "Pipeline deleted successfully",
                  });
                  refetchQueries([GET_USER_PIPELINES_QUERY]);
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

      {/* Edit Modal */}
      <PipelineDialogForm
        initialData={row.original}
        isOpen={editModalOpen}
        setIsOpen={setEditModalOpen}
      />
    </>
  );
};
