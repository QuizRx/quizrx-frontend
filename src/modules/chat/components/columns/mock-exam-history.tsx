"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatToShortDate } from "./utils";

// Define the MockExamHistory type to match the query
type MockExamHistory = {
  _id: string;
  mockExamId: string;
  score: number;
  createdAt: string;
  questionIds: string[];
  title: string;
  timeSpent?: number;
  totalQuestions: number;
};

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  if (min && sec) return `${min} Min ${sec} Sec`;
  if (min) return `${min} Min`;
  if (sec) return `${sec} Sec`;
  return "";
}

export const mockExamHistoryColumns: ColumnDef<MockExamHistory>[] = [
  {
    accessorKey: "title",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => {
      return <div className="text-left">{row.original.title}</div>;
    },
  },
  {
    accessorKey: "score",
    header: () => <div className="text-left">Score</div>,
    cell: ({ row }) => {
      const totalQuestions = row.original.questionIds.length;

      // original score is in percentage
      // we need to convert it number of questions
      const fraction = row.original.score / 100;
      const numberofQuestions = (fraction * totalQuestions).toFixed(0);

      if (row.original.score)
        return (
          <div className="text-left capitalize">{`${row.original.score}% (${numberofQuestions}/${totalQuestions})`}</div>
        );
    },
  },
  {
    accessorKey: "timeSpent",
    header: () => <div className="text-left">Time Spent</div>,
    cell: ({ row }) => {
      if (row.original.timeSpent)
        return (
          <div className="text-left">{formatTime(row.original.timeSpent)}</div>
        );
    },
  },

  {
    accessorKey: "totalQuestions",
    header: () => <div className="text-left"># Question</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.questionIds.length}</div>
    ),
  },

  {
    accessorKey: "dateCreated",
    header: () => <div className="text-left">Date</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {formatToShortDate(row.original.createdAt.toString())}
      </div>
    ),
  },
];
