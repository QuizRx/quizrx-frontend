"use client";

import { useMutation, useApolloClient } from "@apollo/client";
import { DELETE_FILE } from "@/modules/graph/apollo/mutation/file-management";
import { GET_USER_FILES } from "@/modules/graph/apollo/query/file-management";
import { UploadedFile } from "@/modules/graph/types/api/uploaded-file";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreVertical, Trash } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useToast } from "@/core/hooks/use-toast";
import SavedIcon from "../icons/saved";
import CorrectIcon from "../icons/correct";
import IncorrectIcon from "../icons/incorrect";
import { Question } from "../../types/api/question";
import { formatToShortDate } from "./utils";

export const recentlyGeneratedQuizColumns: ColumnDef<Question>[] = [
  {
    accessorKey: "topic",
    header: () => <div className="text-left">Topic</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium capitalize">{row.original.topic}</div>
      );
    },
  },
  {
    accessorKey: "sub_topic",
    header: () => <div className="text-left">Subtopic</div>,
    cell: ({ row }) => {
      return <div className="text-left">{row.original.sub_topic}</div>;
    },
  },
  {
    accessorKey: "questionType",
    header: () => <div className="text-left">Question Type</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left capitalize">{row.original.question_type}</div>
      );
    },
  },
  {
    accessorKey: "isUserAnswerCorrect",
    header: () => <div className="text-left">Correct</div>,
    cell: ({ row }) => {
      const value = row.original.isUserAnswerCorrect;

      return (
        <div className="text-left">
          {row.original.isUserAnswerCorrect === null ? null : value ? (
            <CorrectIcon />
          ) : (
            <IncorrectIcon />
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "isSaved",
    header: () => <div className="text-left">Saved</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.isSaved && <SavedIcon />}</div>
    ),
  },
  {
    accessorKey: "dateCreated",
    header: () => <div className="text-left">Date Created</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {formatToShortDate(row.original.createdAt.toString())}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      return <UploadedFileActions row={row} />;
    },
  },
];

export const savedQuizColumns: ColumnDef<Question>[] = [
  {
    accessorKey: "topic",
    header: () => <div className="text-left">Topic</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium capitalize">{row.original.topic}</div>
      );
    },
  },
  {
    accessorKey: "sub_topic",
    header: () => <div className="text-left">Subtopic</div>,
    cell: ({ row }) => {
      return <div className="text-left">{row.original.sub_topic}</div>;
    },
  },
  {
    accessorKey: "questionType",
    header: () => <div className="text-left">Question Type</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left capitalize">{row.original.question_type}</div>
      );
    },
  },
  {
    accessorKey: "isUserAnswerCorrect",
    header: () => <div className="text-left">Correct</div>,
    cell: ({ row }) => {
      const value = row.original.isUserAnswerCorrect;
      return (
        <div className="text-left">
          {row.original.isUserAnswerCorrect === null ? null : value ? (
            <CorrectIcon />
          ) : (
            <IncorrectIcon />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isSaved",
    header: () => <div className="text-left">Saved</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.isSaved && <SavedIcon />}</div>
    ),
  },
  {
    accessorKey: "dateCreated",
    header: () => <div className="text-left">Date Created</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {formatToShortDate(row.original.createdAt.toString())}
      </div>
    ),
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
        {/* <DropdownMenuSeparator /> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
