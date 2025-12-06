"use client";

import PageTitle from "@/core/components/shared/page-title";
import { DataTable } from "@/core/components/table";
import { quizHistoryColumns } from "@/modules/chat/components/columns/quiz-history";
import QuizTabs from "@/modules/chat/layouts/chat/quiz-tabs";
import { useEffect, useState } from "react";
import { GET_USER_QUIZ_QUERY } from "@/modules/chat/apollo/query/quiz";
import { useQuery } from "@apollo/client";
import { useToast } from "@/core/hooks/use-toast";
import { Quiz } from "@/modules/chat/types/api/quiz";
import extractCustomError from "@/core/utils/extract-custom-error";

export default function Page() {
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<Quiz[]>([]);
  const { data, loading, error } = useQuery(GET_USER_QUIZ_QUERY, {
    // Use cache-first for better performance on subsequent visits
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    if (data?.getUserQuiz?.data) {
      setQuizData(data.getUserQuiz.data);
    }
    if (error) {
      const customError = extractCustomError(error);
      customError.map((error) => {
        toast({
          variant: "destructive",
          title: error.message,
          description: error.details.error,
        });
      });
    }
  }, [data, error, toast]);

  const [activeTab, setActiveTab] = useState("Recently Generated");
  const tabs = [
    {
      key: "Recently Generated",
      content: (
        <>
          <DataTable
            isLoading={loading}
            columns={quizHistoryColumns}
            data={quizData}
          ></DataTable>
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto bg-transparent p-4 flex flex-col h-[90vh]">
      <PageTitle
        title={"Quiz History"}
        description={"Explore previously curated questions."}
      />
      <div className="w-full">
        <DataTable
          isLoading={loading}
          columns={quizHistoryColumns}
          data={quizData}
          drawerType="quiz"
        ></DataTable>
      </div>
    </div>
  );
}
