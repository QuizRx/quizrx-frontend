"use client";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Copy, Edit, Eye, MoreHorizontal, MoreVertical, RefreshCw, Trash, Trash2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";

interface EndocrineTopic {
  name: string;
  sub_topics: string[];
  description: string;
  masteryLevel: string;
  totalQuestions: number;
}

export const endocrineTopicsColumns: ColumnDef<EndocrineTopic>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="h-6 w-6 hover:cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        disabled={row.original.totalQuestions === 0}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="h-6 w-6 hover:cursor-pointer"
      />
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left">Topic</div>,
    cell: ({ row }) => {
      return <div className="text-left font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "subtopic",
    header: () => <div className="text-left">Subtopic</div>,
            cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-left max-w-[200px] truncate cursor-pointer">
            {row.original.sub_topics.join(', ')}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <div className="space-y-1">
            {row.original.sub_topics.map((subtopic, index) => (
              <div key={index} className="text-sm">
                {subtopic}
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    ),
  },
  // {
  //   accessorKey: "masteryLevel",
  //   header: () => <div className="text-left">Mastery Level</div>,
  //   cell: ({ row }) => (
  //     <div className="text-left capitalize">
  //       {row.original.masteryLevel.toLowerCase()}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "totalQuestions",
    header: () => <div className="text-left"># of Questions</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.totalQuestions}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: ({ row, table }) => {
      // @ts-ignore - We're passing custom props to the table
      const { onEdit, onDelete } = table.options.meta?.actions || {};
      return (
        <div className="text-right">
          <EndocrineTopicsActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      );
    },
  },
];

// LLM Call interface definition
export interface LLMCall {
  id: string;
  timestamp: string | Date;
  model: string;
  prompt: string;
  response: string;
  duration?: number; // in milliseconds
  tokenCount?: {
    input: number;
    output: number;
    total?: number;
  };
  status: "success" | "error" | "pending" | "cancelled";
  cost?: number; // in USD
  error?: string;
  metadata?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    userId?: string;
    sessionId?: string;
    [key: string]: any;
  };
}

// LLM Call Actions component
interface LLMCallActionsProps {
  row: any; // Row from the table
  onView?: (call: LLMCall) => void;
  onRetry?: (call: LLMCall) => void;
  onDelete?: (call: LLMCall) => void;
}

const LLMCallActions: React.FC<LLMCallActionsProps> = ({
  row,
  onView,
  onRetry,
  onDelete,
}) => {
  const call = row.original as LLMCall;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(call.id)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(call.prompt)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Prompt
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(call.response)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Response
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {onView && (
          <DropdownMenuItem onClick={() => onView(call)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}

        {onRetry && call.status === "error" && (
          <DropdownMenuItem onClick={() => onRetry(call)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Call
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(call)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export const llmCallsColumns: ColumnDef<LLMCall>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="h-5 w-5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "timestamp",
    header: () => <div className="text-left">Timestamp</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-mono text-sm">
          {new Date(row.original.timestamp).toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "model",
    header: () => <div className="text-left">Model</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.original.model}</div>
    ),
  },
  {
    accessorKey: "prompt type",
    header: () => <div className="text-left">Prompt Type</div>,
    cell: ({ row }) => (
      <div className="text-left max-w-xs truncate" title={row.original.prompt}>
        {row.original.prompt}
      </div>
    ),
  },
  // {
  //   accessorKey: "response",
  //   header: () => <div className="text-left">Response</div>,
  //   cell: ({ row }) => (
  //     <div className="text-left max-w-xs truncate" title={row.original.response}>
  //       {row.original.response}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "duration",
    header: () => <div className="text-left">Duration (ms)</div>,
    cell: ({ row }) => (
      <div className="text-left font-mono">
        {row.original.duration?.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "tokenCount",
    header: () => <div className="text-left">Tokens</div>,
    cell: ({ row }) => (
      <div className="text-left font-mono">
        {row.original.tokenCount?.input || 0} / {row.original.tokenCount?.output || 0}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => (
      <div className="text-left">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            row.original.status === "success"
              ? "bg-green-100 text-green-800"
              : row.original.status === "error"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.original.status}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-left">Cost ($)</div>,
    cell: ({ row }) => (
      <div className="text-left font-mono">
        {row.original.cost ? `$${row.original.cost.toFixed(4)}` : "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      // @ts-ignore - We're passing custom props to the table
      const { onView, onRetry, onDelete } = table.options.meta?.actions || {};
      return (
        <div className="text-right">
          <LLMCallActions
            row={row}
            onView={onView}
            onRetry={onRetry}
            onDelete={onDelete}
          />
        </div>
      );
    },
  },
];

const EndocrineTopicsActions = ({
  row,
  onEdit,
  onDelete,
}: {
  row: Row<EndocrineTopic>;
  onEdit?: (topic: EndocrineTopic) => void;
  onDelete?: (id: string) => void;
}) => {
  const topic = row.original;
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
        <DropdownMenuItem
          onClick={() => onEdit && onEdit(topic)}
          className="text-green-600"
        >
          <Edit color="green" className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete && onDelete(topic.name)}
          className="text-red-500 focus:text-red-500"
        >
          <Trash color="red" className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
