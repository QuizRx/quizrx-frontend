import React, { useMemo, useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/core/components/ui/tabs";
import { Card, CardContent } from "@/core/components/ui/card";
import { Check, X, Clock, Volume2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Separator } from "@/core/components/ui/separator";
import { useAvatarStore } from "../../store/avatar-store";
import { EnhancedExplanation } from "../../components/EnhancedExplanation";
import { EnhancedExplanation as EnhancedExplanationType } from "../../types/api/question";

interface QuizReviewTabsProps {
  questions: any[];
  answers: any[];
}

const QuizReviewTabs: React.FC<QuizReviewTabsProps> = ({
  questions,
  answers,
}) => {
  const [tab, setTab] = useState("all");
  const { talk } = useAvatarStore(); // Added avatar store hook

  // Handle explanation speech
  const handleSpeakExplanation = async (
    explanation: string | EnhancedExplanationType,
    questionText: string,
    answerText: string
  ) => {
    // Extract text from explanation (handle both string and enhanced format)
    const explanationText =
      typeof explanation === "string"
        ? explanation
        : explanation.correct_answer.explanation;

    await talk(
      `Your goal is to explain for the user the explanation, be more educative as possible, Here's the question: ${questionText}. This is the answer: ${answerText}. This is the explanation: ${explanationText}`,
      "chat"
    );
  };

  // Merge questions with user answers
  const questionList = useMemo(() => {
    return questions.map((q, idx) => {
      const userAnswer = answers.find((a) => a.questionId === q._id);
      return {
        ...q,
        userAnswer: userAnswer?.answer,
        isCorrect: userAnswer?.isCorrect,
        index: idx,
      };
    });
  }, [questions, answers]);

  const filteredQuestions = useMemo(() => {
    if (tab === "correct")
      return questionList.filter((q) => q.isCorrect === true);
    if (tab === "incorrect")
      return questionList.filter((q) => q.isCorrect === false);
    return questionList;
  }, [tab, questionList]);

  return (
    <div className="mt-2 bg-white rounded-lg sm:p-4 max-w-full overflow-x-hidden">
      <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
        Question Review
      </h2>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-3 sm:mb-4 w-full flex flex-wrap sm:flex-nowrap justify-around gap-1 sm:gap-0">
          <TabsTrigger
            className="hover:bg-primary hover:text-white hover:cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
            value="all"
          >
            <span className="hidden sm:inline">All Questions</span>
            <span className="sm:hidden">All</span> ({questionList.length})
          </TabsTrigger>
          <TabsTrigger
            className="hover:bg-primary hover:text-white hover:cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
            value="correct"
          >
            <span className="hidden sm:inline">Correct</span>
            <span className="sm:hidden">✓</span> (
            {questionList.filter((q) => q.isCorrect === true).length})
          </TabsTrigger>
          <TabsTrigger
            className="hover:bg-primary hover:text-white hover:cursor-pointer text-xs sm:text-sm px-2 sm:px-3"
            value="incorrect"
          >
            <span className="hidden sm:inline">Incorrect</span>
            <span className="sm:hidden">✗</span> (
            {questionList.filter((q) => q.isCorrect === false).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-4">
          {filteredQuestions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No questions found.
            </div>
          )}
          {filteredQuestions.map((q, idx) => (
            <Card
              key={q._id}
              className="rounded-lg border-gray-200 max-w-full overflow-x-hidden"
            >
              <CardContent className="p-3 sm:p-4">
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    {q.isCorrect === true && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    )}
                    {q.isCorrect === false && (
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm sm:text-base">
                      Question {q.index + 1}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {q.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs break-words">
                      {q.question_type}
                    </Badge>
                  </div>
                </div>
                {/* Question Info */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <Badge variant="plain" className="text-xs break-words">
                      {q.topic}
                    </Badge>
                    {q.sub_topic && (
                      <Badge variant="plain" className="text-xs break-words">
                        {q.sub_topic}
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Question Text */}
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold mb-2">
                    Question:
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 break-words">
                    {q.question}
                  </p>
                </div>
                {/* Choices */}
                {q.choices && q.choices.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-semibold mb-2">
                      Choices:
                    </h4>
                    <div className="space-y-1">
                      {q.choices.map((choice: string, choiceIndex: number) => (
                        <div
                          key={choiceIndex}
                          className="text-xs sm:text-sm text-gray-600 pl-2 break-words"
                        >
                          {String.fromCharCode(65 + choiceIndex)}. {choice}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Correct Answer */}
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-semibold mb-2 text-green-700">
                    Correct Answer:
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-md p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-green-800 break-words">
                      {q.answer}
                    </p>
                  </div>
                </div>
                {/* User Answer */}
                {q.userAnswer && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-semibold mb-2">
                      Your Answer:
                    </h4>
                    <div
                      className={`border rounded-md p-2 sm:p-3 ${
                        q.isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center flex-wrap gap-2">
                        <span
                          className={`text-xs sm:text-sm break-words ${
                            q.isCorrect ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          {q.userAnswer}
                        </span>
                        <Badge
                          variant={q.isCorrect ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {q.isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}{" "}
                {/* Explanation */}
                {q.explanation && (
                  <div className="mb-3 sm:mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold">
                        Explanation:
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleSpeakExplanation(
                            q.explanation,
                            q.question,
                            q.answer
                          )
                        }
                        className="flex items-center gap-1 text-xs w-full sm:w-auto"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Read Explanation</span>
                      </Button>
                    </div>
                    <EnhancedExplanation
                      explanation={q.explanation}
                      generationTime={q.generationTime}
                    />
                  </div>
                )}
                {/* Metadata */}
                <div className="pt-2 sm:pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500">
                    <span className="break-words">Topic: {q.topic}</span>
                    {q.sub_topic && (
                      <span className="break-words">
                        • Subtopic: {q.sub_topic}
                      </span>
                    )}
                    <span className="break-words">
                      • Type: {q.question_type}
                    </span>
                    <span>• Level: {q.level}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizReviewTabs;
