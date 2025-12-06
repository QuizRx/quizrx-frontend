"use client";
import { ColumnDef } from "@tanstack/react-table";
import { FileWithEmbedding } from "../../types/api/embedding";
import { Checkbox } from "@/core/components/ui/checkbox";
import { formatFileSize } from "@/core/utils/format-file-size";
import moment from "moment";

// Modified to take selectedFileId and onSelectChange as parameters
export const fileEmbeddingColumns = (
  selectedFileId: string | null,
  onSelectChange: (fileId: string) => void
): ColumnDef<FileWithEmbedding>[] => [
  {
    id: "select",
    header: () => <div></div>,
    cell: ({ row }) => {
      const fileId = row.original._id; // Assuming FileWithEmbedding has an id field

      return (
        <div className="text-left">
          <Checkbox
            checked={selectedFileId === fileId}
            onCheckedChange={() => onSelectChange(fileId)}
            aria-label="Select file"
          />
        </div>
      );
    },
    enableSorting: false,
  },
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
          {moment(row.original.createdAt).format("do MMMM, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "mimetype",
    header: () => <div className="text-left">Type</div>,
    cell: ({ row }) => <div className="text-left">{row.original.mimetype}</div>,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.embeddingStatus}</div>
    ),
  },
];
