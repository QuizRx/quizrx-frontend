"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Quiz } from "../../types/api/quiz";
import { formatToShortDate } from "./utils";

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  if (min && sec) return `${min} Min ${sec} Sec`;
  if (min) return `${min} Min`;
  if (sec) return `${sec} Sec`;
  return "";
}

export const quizHistoryColumns: ColumnDef<Quiz>[] = [
  {
    accessorKey: "quizName",
    header: () => <div className="text-left">Quiz Name</div>,
    cell: ({ row }) => {
      return <div className="text-left">{row.original.quizName}</div>;
    },
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
  {
    accessorKey: "totalQuestions",
    header: () => <div className="text-left"># Question</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.totalQuestions}</div>
    ),
  },
  {
    accessorKey: "score",
    header: () => <div className="text-left">Score</div>,
    cell: ({ row }) => {
      const fraction = row.original.score / row.original.totalQuestions;
      const percentage = (fraction * 100).toFixed(0);
      if (row.original.score)
        return (
          <div className="text-left capitalize">{`${percentage}% (${row.original.score}/${row.original.totalQuestions})`}</div>
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
];
