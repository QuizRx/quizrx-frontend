"use client";

import { Collection } from "@/modules/graph/types/api/collection";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/core/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";

const CustomCollectionTableHeader = ({
  title,
  collection,
  openEditDialog,
  openDeleteDialog,
}: {
  title: string;
  collection: Collection;
  openEditDialog: (collection: Collection) => void;
  openDeleteDialog: (collection: Collection) => void;
}) => (
  <div className="bg-transparent border-none">
    <div className="px-0 pt-2 pb-6 border-0 shadow-none">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditDialog(collection)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(collection)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>
);

export default CustomCollectionTableHeader;
