"use client";

import PageTitle from "@/core/components/shared/page-title";
import { DataTable } from "@/core/components/table";
import {
  recentlyGeneratedQuizColumns,
  savedQuizColumns,
} from "@/modules/chat/components/columns/quiz-recently-generated";
import { PaginationControls } from "@/modules/chat/components/pagination-controls";
import QuizTabs from "@/modules/chat/layouts/chat/quiz-tabs";
import { useQuestion } from "@/modules/chat/store/question-store";
import { useEffect, useState } from "react";
import { useAuth } from "@/core/providers/auth";

export default function Page() {
  const {
    userSavedQuestions,
    userArchivedQuestions,
    loadUserSavedQuestions,
    loadUserArchivedQuestions,
    loadNextSavedPage,
    loadPrevSavedPage,
    loadNextArchivedPage,
    loadPrevArchivedPage,
    savedPagination,
    archivedPagination,
    isLoading,
  } = useQuestion();

  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("Saved Questions");
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    // Only load data when token is available (indicating Apollo client is ready)
    if (token && !hasInitialLoad) {
      // Load initial data for the active tab only
      if (activeTab === "Saved Questions") {
        loadUserSavedQuestions({ isSaved: true }, 1);
      } else if (activeTab === "Archive") {
        loadUserArchivedQuestions(1);
      }
      setHasInitialLoad(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, hasInitialLoad]);

  // Handle tab changes and load appropriate data
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Load data for the new tab
    if (token) {
      if (tab === "Saved Questions") {
        loadUserSavedQuestions({ isSaved: true }, 1);
      } else if (tab === "Archive") {
        loadUserArchivedQuestions(1);
      }
    }
  };

  const tabs = [
    {
      key: "Saved Questions",
      content: (
        <div className="space-y-4">
          <DataTable
            isLoading={isLoading}
            columns={savedQuizColumns}
            data={userSavedQuestions}
            drawerType="question"
          />
          <PaginationControls
            pagination={savedPagination}
            onNextPage={loadNextSavedPage}
            onPrevPage={loadPrevSavedPage}
            onGoToPage={(page) =>
              loadUserSavedQuestions({ isSaved: true }, page)
            }
            isLoading={isLoading}
            className="mt-4"
          />
        </div>
      ),
    },
    {
      key: "Archive",
      content: (
        <div className="space-y-4">
          <DataTable
            isLoading={isLoading}
            columns={recentlyGeneratedQuizColumns}
            data={userArchivedQuestions}
            drawerType="question"
          />
          <PaginationControls
            pagination={archivedPagination}
            onNextPage={loadNextArchivedPage}
            onPrevPage={loadPrevArchivedPage}
            onGoToPage={(page) => loadUserArchivedQuestions(page)}
            isLoading={isLoading}
            className="mt-4"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto bg-transparent p-4 flex flex-col h-[90vh]">
      <PageTitle
        title={"Question History"}
        description={"Explore previously curated questions."}
      />
      <div className="w-full">
        <QuizTabs
          activeTab={activeTab}
          onSetActiveTab={handleTabChange}
          tabs={tabs}
        />
      </div>
    </div>
  );
}
