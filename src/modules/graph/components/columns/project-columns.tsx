"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Info, Table2, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { Project } from "../../types/api/project";

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => {
      const isActive = row.original.status === "active";
      return (
        <div className="text-left font-medium flex items-center">
          {row.original.name}
          <div
            className={`inline-block w-1.5 h-1.5 rounded-full ml-2 ${
              isActive ? "bg-green-500 animate-ping" : "bg-gray-400"
            }`}
          ></div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="text-left">Type</div>,
    cell: ({ row }) => <div className="text-left">{row.original.type}</div>,
  },
  {
    accessorKey: "environment",
    header: () => {
      return (
        <div className="text-left flex items-center gap-2">
          Environment
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-primary" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-left text-primary">{row.original.environment}</div>
    ),
  },
  {
    accessorKey: "embedding",
    header: () => <div className="text-left">Embedding</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.embedding}</div>
    ),
  },
  {
    accessorKey: "size",
    header: () => <div className="text-left">Size</div>,
    cell: ({ row }) => <div className="text-left">{row.original.size}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <Table2 className="h-4 w-4 text-primary cursor-pointer" />
          <Trash className="h-4 w-4 text-primary cursor-pointer" />
        </div>
      );
    },
  },
];
