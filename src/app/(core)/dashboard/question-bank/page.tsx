"use client";

import { DataTable } from "@/core/components/table/data-table";
import { Separator } from "@/core/components/ui/separator";
import { toast } from "@/core/hooks/use-toast";
import { GET_USER_QUESTION_BANKS_QUERY } from "@/modules/chat/apollo/query/question-bank";
import { endocrineTopicsColumns } from "@/modules/chat/components/columns/question-bank";
import PageFilterHeader from "@/modules/chat/components/shared/page-filter";
import QuestionBankActions from "@/modules/chat/layouts/dashboard/question-bank/question-bank-actions";
import { QuestionBank } from "@/modules/chat/types/api/question-bank";
import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CreateQuizDialogForm from "@/modules/chat/layouts/forms/create-quiz-dialog";
import { useChat } from "@/modules/chat/store/chat-store";
import { GENERATE_QUIZ,GENERATE_QUIZ_FROM_QUESTION_BANKS } from "@/modules/chat/apollo/mutation/quiz";
import { useRouter } from "next/navigation";
import { FIND_ALL_TOPICS_QUERY } from "@/modules/chat/apollo/query/topics";
import { GENERATE_MOCK_EXAM } from "@/modules/chat/apollo/mutation/mockExam";

interface QuizRowSelection {
  [key: number]: boolean;
}

export default function Page() {
  const formSchema = z.object({
    title: z.string().min(1, "Quiz name is required"),
  });
  const {
    data,
    error,
    refetch,
    loading: isLoadingQuestionBank,
  } = useQuery(GET_USER_QUESTION_BANKS_QUERY, {
    // Use cache-first for better performance on subsequent visits
    fetchPolicy: "cache-first",
  });

  const { data: topicsData, loading: isLoadingTopics } = useQuery(FIND_ALL_TOPICS_QUERY, {
    // Use cache-first for better performance on subsequent visits
    fetchPolicy: "cache-first",
  });

  const { loadThread, fetchAvailableThreads } = useChat();
  const router = useRouter();

  const [collections, setCollections] = useState<QuestionBank[]>([]);
  const [generateQuiz, { loading: isGeneratingQuiz }] =
      useMutation(GENERATE_QUIZ);
  const [generateQuizFromQuestionBanks, { loading: isGeneratingQuizFromQuestionBanks }] =
    useMutation(GENERATE_QUIZ_FROM_QUESTION_BANKS);

  const [generateMockExam, { loading: isGeneratingMockExam }] =
    useMutation(GENERATE_MOCK_EXAM);


  const [quizRowSelection, setQuizRowSelection] = useState<QuizRowSelection>(
    {}
  );

  const selectedTopics = topicsData?.topics
    ?.map((topic, index) => {
      if (quizRowSelection[index]) {
        return topic.title;
      }
      return;
    })
    .filter(Boolean);

  const handleRowSelectionChange = (selection: any) => {
    setQuizRowSelection(selection);
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [quizType, setQuizType] = useState<"automated" | "selected" | "mock">(
    "automated"
  );
  const [selectedQuestionBanks, setSelectedQuestionBanks] = useState<
    QuestionBank[]
  >([]);
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (data?.getUserQuestionBanks?.data) {
      setCollections(data.getUserQuestionBanks.data);
    }
  }, [data]);

  if (error) {
    toast({
      title: "Error",
      description: error.message || "Failed to load collections",
      variant: "destructive",
    });
    return <div>Error loading collections: {error.message}</div>;
  }

  const formattedCollection =
    topicsData?.topics?.map((topic) => {
      const matchedByTopic = collections.filter(
        (collection) => collection.name === topic.title
      );

      const allSubTopics = matchedByTopic.flatMap(
        (collection) => collection.sub_topics
      );

      const uniqueSubTopics = [...new Set(allSubTopics)];

      return {
        name: topic.title,
        sub_topics: uniqueSubTopics,
        description: "",
        masteryLevel: "",
        totalQuestions: matchedByTopic.reduce(
          (acc, curr) => acc + curr.totalQuestions,
          0
        ),
        questionBankId: matchedByTopic[0]?._id || null,
      };
    }) || [];

  const handleCreateQuiz = async (values: z.infer<typeof formSchema>) => {
    const isSelection = Object.entries(quizRowSelection).length > 0;
    try {
      if (quizType === "automated") {
        const thread = await generateQuiz({
          variables: { title: isSelection ? values.title : values.title },
        });

        Object.entries(quizRowSelection).length > 0;

        if (thread?.data) {
          fetchAvailableThreads();
          loadThread(thread.data.generateQuiz._id);
          router.push(`/dashboard?thread=${thread.data.generateQuiz._id}`);
        }
      }

      if (quizType === "selected") {
        const questionBankIds = selectedQuestionBanks.map(
          (questionBank) => questionBank._id
        );
        const thread = await generateQuizFromQuestionBanks({
          variables: {
            title: values.title,
            questionBankIds,
          },
        });

        if (thread?.data) {
          fetchAvailableThreads();
          loadThread(thread.data.generateQuizFromQuestionBanks._id);
          router.push(`/dashboard?thread=${thread.data.generateQuizFromQuestionBanks._id}`);
        }
      }

      if (quizType === "mock") {
         await generateMockExam({
          variables: { title: values.title },
        });

        router.push(`/dashboard/mock-exams`);
      }

    } catch (error) {
      console.log(error);
    }
  };

  // Combine loading states for better UX
  const isLoading = isLoadingQuestionBank || isLoadingTopics;

  return (
    <div className="mx-auto px-4 py-6 bg-transparent flex flex-col h-[90vh]">
      <PageFilterHeader
        title="Question Bank"
        description="Explore disorders of the hormonal systems including diabetes, thyroid, and adrenal."
      />

      <Separator />

      <QuestionBankActions
        selectedTopics={selectedTopics}
        questions={collections}
        setIsCreateOpen={setIsCreateOpen}
        setQuizType={setQuizType}
        setSelectedQuestionBanks={setSelectedQuestionBanks}
      />

      <div>
        <div className="border-b pb-8 last:border-b-0">
          <DataTable
            customRowSelection={quizRowSelection}
            onRowSelectionChange={handleRowSelectionChange}
            columns={endocrineTopicsColumns}
            data={formattedCollection}
            drawerType="question-bank"
            isLoading={isLoading}
            headerStyle="bg-primary/15"
          />
        </div>
      </div>

      <CreateQuizDialogForm
        loading={isGeneratingQuiz || isGeneratingQuizFromQuestionBanks || isGeneratingMockExam}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        createForm={createForm}
        handleCreateQuiz={handleCreateQuiz}
        quizType={quizType}
        selectedQuestionBanks={selectedQuestionBanks}
      />
    </div>
  );
}
