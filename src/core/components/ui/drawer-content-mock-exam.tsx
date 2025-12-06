import React, { useState } from "react";
import { Question } from "@/modules/chat/types/api/question";
import { useQuery } from "@apollo/client";
import { GET_QUESTIONS_BY_IDS_QUERY } from "@/modules/chat/apollo/query/question";
import { AnimatePresence, motion } from "motion/react";
import { Check, X, Clock, RotateCcw, Trash } from "lucide-react";
import { Separator } from "@/core/components/ui/separator";
import { Card } from "@/core/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { DELETE_MOCK_EXAM_HISTORY } from "@/modules/chat/apollo/mutation/mock-exam-history";
import { Button } from "@/core/components/ui/button";
import { useMutation } from "@apollo/client";
import { toast } from "@/core/hooks/use-toast";
import { useRouter } from "next/navigation";
import { EnhancedExplanation } from "@/modules/chat/components/EnhancedExplanation";

interface DrawerContentQuestionProps {
  questionIds?: string[] | null;
  onOpenChange: any;
  data: any;
  refetchFunction?: () => void;
}

const cardAnimation = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const DrawerContentMockExam = ({
  questionIds,
  onOpenChange,
  data,
  refetchFunction,
}: DrawerContentQuestionProps) => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const [deleteMockExamHistory, { loading, error }] = useMutation(
    DELETE_MOCK_EXAM_HISTORY
  );

  const handleRemove = async () => {
    try {
      await deleteMockExamHistory({ variables: { id: data._id } });
      if (refetchFunction) {
        refetchFunction();
      }
      onOpenChange(false);
      toast({
        title: "Question removed",
        description: "Question has been removed from your question bank",
      });
    } catch (err: any) {
      toast({
        title: "Failed to remove question",
        description:
          err?.message || "An error occurred while removing the question.",
        variant: "destructive",
      });
    }
  };

  const handleReattempt = async () => {
    router.push(`/dashboard/mock-exams?mockExamId=${data.mockExamId}`);
  };

  const {
    data: questionsData,
    loading: questionsLoading,
    error: questionsError,
  } = useQuery(GET_QUESTIONS_BY_IDS_QUERY, {
    variables: {
      questionIds: questionIds || [],
    },
    skip: !questionIds || questionIds.length === 0,
  });

  if (questionsLoading) {
    return (
      <div className="px-6 py-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="px-6 py-4">
        <div className="text-red-500 text-sm">
          Error loading questions: {questionsError.message}
        </div>
      </div>
    );
  }

  const questions = questionsData?.getQuestionsByIds || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4 mx-6 overflow-hidden pt-2">
        <Button
          // disabled={isReattemptingQuestion}
          // loading={isReattemptingQuestion}
          variant="outline"
          className="bg-white flex-1 min-w-0"
          onClick={handleReattempt}
        >
          <RotateCcw className="w-4 h-4" />
          Retake Exam
        </Button>
        <Button
          disabled={loading}
          loading={loading}
          onClick={handleRemove}
          className="bg-red-100 hover:bg-red-200 text-red-500 flex-1 min-w-0"
        >
          <Trash className="w-4 h-4" />
          Remove
        </Button>
      </div>
      <Separator />

      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="space-y-4"
      >
        <AnimatePresence>
          {questions.map((question: Question, index: number) => {
            const questionId = `question-${index}`;
            const sectionTitle =
              question.question?.substring(0, 50) +
                (question.question?.length > 50 ? "..." : "") ||
              `Question ${index + 1}`;
            const isCorrect = question.isUserAnswerCorrect;
            const hasAnswer = question.isUserAnswerCorrect !== null;

            return (
              <motion.div
                key={question._id}
                variants={cardAnimation}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
              >
                <AccordionItem value={questionId} className="border-none">
                  <Card
                    className={`rounded-lg transition-colors border-gray-300 mx-4`}
                  >
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="flex-1 text-left flex items-center gap-2">
                        <h2 className="text-sm font-medium">{sectionTitle}</h2>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-4 space-y-4">
                      {/* Question Status */}
                      <div className="px-4">
                        <div className="flex gap-4">
                          {hasAnswer && (
                            <span
                              className={`${
                                isCorrect
                                  ? "bg-green-50 border-green-200 text-green-600"
                                  : "bg-red-50 border-red-200 text-red-600"
                              } py-1 px-2 rounded-full text-xs border flex gap-1 items-center`}
                            >
                              {isCorrect ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              {isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          )}

                          <span className="py-1 px-2 rounded-full text-xs bg-blue-50 text-primary capitalize">
                            {question.question_type}
                          </span>
                        </div>

                        <span className="mt-3 flex items-center text-xs text-gray-600 gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(question.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <Separator />

                      {/* Topic */}
                      <div className="flex flex-col justify-start text-sm px-4">
                        <span>Topic</span>
                        <span className="capitalize font-semibold mt-1">
                          {question.topic}
                        </span>
                      </div>

                      {/* Question */}
                      <div className="border-l-4 border-gray-100 mx-4 pl-4 text-xs">
                        <span className="font-semibold">Question</span>
                        <p className="mt-4">{question.question}</p>
                      </div>

                      {/* Answer */}
                      {hasAnswer && (
                        <div className="border-l-4 border-gray-100 mx-4 pl-4 text-xs">
                          <span className="font-semibold">Your Answer</span>
                          <div
                            className={`${
                              isCorrect
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            } flex items-center justify-between mt-4 py-4 px-8 rounded-xl text-xs`}
                          >
                            <p className="w-2/3">{question.answer}</p>
                            <div
                              className={`${
                                isCorrect
                                  ? "bg-green-50 border-green-200 text-green-600"
                                  : "bg-red-50 border-red-200 text-red-600"
                              } flex gap-2`}
                            >
                              {isCorrect ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              {isCorrect ? "Correct" : "Incorrect"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mx-4">
                          <EnhancedExplanation
                            explanation={question.explanation}
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Accordion>

      {questions.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          No questions found in this mock exam.
        </div>
      )}
    </div>
  );
};

export default DrawerContentMockExam;
