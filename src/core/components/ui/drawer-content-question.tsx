import React from "react";
import { Question } from "@/modules/chat/types/api/question";
import { Separator } from "@/core/components/ui/separator";
import { Check, X, Clock, Trash, RotateCcw } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { gql, useMutation } from "@apollo/client";
import {
  REATTEMPT_QUESTION_MUTATION,
  DELETE_QUESTION,
} from "@/modules/chat/apollo/mutation/question";
import { toast } from "@/core/hooks/use-toast";
import { useQuestion } from "@/modules/chat/store/question-store";
import { useRouter } from "next/navigation";
import { useChat } from "@/modules/chat/store/chat-store";
import { EnhancedExplanation } from "@/modules/chat/components/EnhancedExplanation";

interface DrawerContentQuestionProps {
  data: Question;
  onOpenChange: any;
}

const DrawerContentQuestion = ({
  data,
  onOpenChange,
}: DrawerContentQuestionProps) => {
  const router = useRouter();

  const { loadThread, fetchAvailableThreads } = useChat();

  const { removeQuestion } = useQuestion();

  const [deleteQuestion, { loading, error }] = useMutation(DELETE_QUESTION);
  const [reattemptQuestion, { loading: isReattemptingQuestion }] = useMutation(
    REATTEMPT_QUESTION_MUTATION
  );

  const handleReattempt = async () => {
    const thread = await reattemptQuestion({
      variables: { input: { questionId: data._id } },
    });

    if (thread?.data) {
      fetchAvailableThreads();
      loadThread(thread.data.reattemptQuestion._id);
      router.push(`/dashboard?thread=${thread.data.reattemptQuestion._id}`);
    }
  };

  const handleRemove = async () => {
    try {
      await deleteQuestion({ variables: { id: data._id } });
      removeQuestion(data._id);
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

  return (
    <div className="w-full rounded-lg  bg-white space-y-4">
      <Separator />
      <div className="px-6">
        <div className="flex gap-4">
          {data.isUserAnswerCorrect !== null && (
            <span
              className={`${
                data.isUserAnswerCorrect
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-red-50 border-red-200 text-red-600"
              } py-1 px-2 rounded-full text-xs border flex gap-1 items-center`}
            >
              {data.isUserAnswerCorrect ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {data.isUserAnswerCorrect ? "Correct" : "Incorrect"}
            </span>
          )}

          <span className="py-1 px-2 rounded-full text-xs bg-blue-50 text-primary capitalize">
            {data.question_type}
          </span>
        </div>

        <span className="mt-3 flex items-center text-xs text-gray-600 gap-1">
          <Clock className="w-4 h-4" />
          {new Date(data.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <Separator />

      <div className="flex flex-col justify-start text-sm mt-4 px-6">
        <span>Topic</span>
        <span className="capitalize font-semibold mt-1">{data.topic}</span>
      </div>

      <div className="border-l-4 border-gray-100 mx-4 pl-4 text-xs">
        <span className="font-semibold">Question</span>
        <p className="mt-4">{data.question}</p>
      </div>
      <div className="border-l-4 border-gray-100 mx-4 pl-4 text-xs mt-8 mb-4">
        <span className="font-semibold">Your Answer</span>
        <div
          className={`${
            data.isUserAnswerCorrect
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } flex items-center justify-between mt-4 py-4 px-8 rounded-xl text-xs`}
        >
          <p className="w-2/3">{data.answer}</p>
          <div
            className={`${
              data.isUserAnswerCorrect
                ? "bg-green-50 border-green-200 text-green-600"
                : "bg-red-50 border-red-200 text-red-600"
            } flex gap-2`}
          >
            {data.isUserAnswerCorrect ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {data.isUserAnswerCorrect ? "Correct" : "Incorrect"}
          </div>
        </div>
      </div>
      <div className="mx-4 mt-8 mb-4">
        <EnhancedExplanation explanation={data.explanation} />
      </div>

      <Separator />
      <div className="flex justify-center gap-4 mx-6 overflow-hidden pt-2">
        <Button
          disabled={isReattemptingQuestion}
          loading={isReattemptingQuestion}
          variant="outline"
          className="bg-white flex-1 min-w-0"
          onClick={handleReattempt}
        >
          <RotateCcw className="w-4 h-4" />
          Reattempt
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
    </div>
  );
};

export default DrawerContentQuestion;
