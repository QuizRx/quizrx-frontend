"use client";
import { Chunks } from "@/modules/graph/types/api/chunk";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";

export const collectionChunksColumns: ColumnDef<Chunks>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Configuration Name</div>,
    cell: ({ row }) => {
      return <div className="text-left font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "environmentName",
    header: () => <div className="text-left">Environment Name</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.environmentName}</div>
    ),
  },
  {
    accessorKey: "indexName",
    header: () => <div className="text-left">Index Name</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.indexName}</div>
    ),
  },
  {
    accessorKey: "chunkSize",
    header: () => <div className="text-left">Chunk Size</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.chunkSize}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      // @ts-ignore - We're passing custom props to the table
      const { onEdit, onDelete } = table.options.meta?.actions || {};
      return (
        <div className="text-right">
          <CollectionChunksColumnsActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      );
    },
  },
];

const CollectionChunksColumnsActions = ({
  row,
  onEdit,
  onDelete,
}: {
  row: Row<Chunks>;
  onEdit?: (chunk: Chunks) => void;
  onDelete?: (id: string) => void;
}) => {
  const chunk = row.original;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit && onEdit(chunk)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete && onDelete(chunk.id)}
          className="text-red-500 focus:text-red-500"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
