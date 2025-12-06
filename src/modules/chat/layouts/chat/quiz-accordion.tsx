"use client";

import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import { useMutation } from "@apollo/client";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import {
  BookMarked,
  Clock,
  Eye,
  Percent,
  Database,
  CheckSquare,
  XCircle,
  BarChart,
  FileText,
  Timer,
} from "lucide-react";
import { useEffect } from "react";
import { UPDATE_QUESTION_MUTATION } from "../../apollo/mutation/question";
import { UPDATE_QUIZ_MUTATION } from "../../apollo/mutation/quiz";

import { Answer, useQuestionStore } from "../../store/question-state-store";
import { useTimer } from "../../store/timer-store";
import { useSplitView } from "../../store/split-view-store";
import { Citation } from "../../types/api/messages";
import { Citations } from "./message-content-renderer";
import { EnhancedExplanation } from "../../components/EnhancedExplanation";
import { EnhancedExplanation as EnhancedExplanationType } from "../../types/api/question";
import { useChat } from "../../store/chat-store";
import { useAvatarStore } from "../../store/avatar-store";
import { SenderType, MessageType } from "../../types/api/messages";
import { toast } from "@/core/hooks/use-toast";
import Link from "next/link";
import QuizReviewTabs from "./QuizReviewTabs";
import { Quiz } from "../../types/api/quiz";
import { Streaming } from "./streaming";

export default function QuizAccordion({
  questions,
  totalTime = 90,
  citations,
  index,
  quizId,
  fetchedQuiz,
}: {
  questions: any;
  totalTime?: number;
  citations?: Citation[];
  index?: number;
  quizId?: string;
  fetchedQuiz?: Quiz;
}) {
  const [updateQuestion] = useMutation(UPDATE_QUESTION_MUTATION);
  const [submitQuiz] = useMutation(UPDATE_QUIZ_MUTATION);
  const { handleSubmit, messages } = useChat();
  const { setReviewMode } = useSplitView();
  const { talk } = useAvatarStore();

  // Timer hook
  useTimer();

  const {
    currentQuestion,
    currentQuestionIndex,
    timeRemaining,
    showCitations,
    showExplanation,
    isSaving,
    getProgressPercentage,
    answers, // Actions
    initializeQuiz,
    selectAnswer,
    toggleCitations,
    toggleExplanation,
    saveQuestion,
    formatTime,
    getChoiceStyle,
    getAnswerStatistics,
    goToNextQuestion,
    goToPreviousQuestion,
    setAnswer,
    setAnswers,
    quizResult,
    setQuizResult,
  } = useQuestionStore();

  // Initialize quiz when component mounts or questions change
  useEffect(() => {
    if (questions.length > 0) {
      initializeQuiz(questions, totalTime * questions.length);
    }
  }, [questions, totalTime, initializeQuiz]);

  useEffect(() => {
    if (
      Array.isArray(fetchedQuiz?.answers) &&
      fetchedQuiz?.answers.length > 0 &&
      answers.length === 0
    ) {
      const quizData = fetchedQuiz as Quiz;
      const fraction = quizData.score / questions.length;
      const percentage = (fraction * 100).toFixed(0);
      const averageTimePerQuestion = Math.max(
        1,
        Math.ceil(quizData.timeSpent / questions.length)
      );
      setQuizResult({
        timeSpent: quizData?.timeSpent || 0,
        score: `${percentage}%`,
        averageTimePerQuestion,
        correctAnswers: quizData.answers
          ? quizData.answers.filter((a) => a.isCorrect).length || 0
          : 0,
        wrongAnswers: quizData.answers
          ? quizData.answers.filter((a) => !a.isCorrect).length || 0
          : 0,
        totalQuestions: questions.length,
      });
      setAnswers(fetchedQuiz?.answers);
    }
  }, [fetchedQuiz, answers, setAnswers]);

  // Monitor messages for Review Concept AI responses and make avatar speak them
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (
      latestMessage &&
      latestMessage.senderType === SenderType.AI &&
      latestMessage.messageType === MessageType.ANSWER &&
      latestMessage.content &&
      messages.some(
        (m) =>
          m.senderType === SenderType.USER &&
          m.content?.includes(
            "Help me understand the question and provided feedback"
          )
      )
    ) {
      // This is an AI response to a Review Concept request - make avatar speak it
      talk(latestMessage.content, "chat");
    }
  }, [messages, talk]);

  const selectedAnswer = answers.find(
    (a) => a.questionId === currentQuestion?._id
  )?.answer;

  // Event handlers
  const handleSaveQuestion = async () => {
    if (!currentQuestion) return;

    try {
      await saveQuestion(currentQuestion._id, updateQuestion);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleAnswerSelect = (newAnswer: string, answer_index: number) => {
    // selectAnswer(answer, updateQuestion);
    if (!currentQuestion || !currentQuestion.choices[answer_index]) return;

    // const selectedAnswer = currentQuestion.choices[answer_index];
    const isCorrect = currentQuestion?.answer === newAnswer;

    setAnswer({
      questionId: currentQuestion._id,
      answer: newAnswer,
      isCorrect,
    });
  };
  // Updated handleReviewConcept function to trigger split view and avatar speech
  const handleReviewConcept = async () => {
    if (!currentQuestion) return;

    // Check if there's already a review concept conversation in the chat
    const hasExistingReviewConversation = messages.some(
      (message: any) =>
        message.senderType === "USER" &&
        message.content?.includes(
          "Help me understand the question and provided feedback"
        )
    );

    // Enable split view
    setReviewMode(true);

    // Only send a new message if there's no existing review conversation
    if (!hasExistingReviewConversation) {
      const prompt = `Help me understand the question and provided feedback.`;
      handleSubmit(prompt);
      // Wait for AI response and then make avatar speak it
      // Note: This will be handled by monitoring messages in a useEffect
    }
  };

  // Enhanced handleToggleExplanation with avatar speech
  const handleToggleExplanation = async () => {
    if (!currentQuestion) return;

    const wasHidden = !showExplanation;
    // Use the toggleExplanation from the store if available, otherwise handle manually
    if (typeof toggleExplanation === "function") {
      toggleExplanation();
    }

    // If explanation was just shown, make avatar speak it
    if (wasHidden && currentQuestion.explanation) {
      // Extract text from explanation
      const explanationText =
        typeof currentQuestion.explanation === "string"
          ? currentQuestion.explanation
          : (currentQuestion.explanation as EnhancedExplanationType)
              .correct_answer.explanation;

      await talk(
        `Here's the explanation for this question: ${explanationText}`,
        "chat"
      );
    }
  };

  // Get statistics
  const stats = getAnswerStatistics();

  const handleSubmitQuiz = async () => {
    // 1. Validate all questions answered
    if (answers.length !== questions.length) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You need to answer all questions before submitting",
      });
      return;
    }

    if (!quizId) {
      console.error("Quiz ID is missing");
      return;
    }

    if (quizId) {
      const timeSpent = questions.length * 90 - timeRemaining;
      const score = answers.filter((a) => a.isCorrect).length;
      const averageTimePerQuestion = Math.max(
        1,
        Math.ceil(timeSpent / questions.length)
      );
      const fraction = score / questions.length;
      const percentage = (fraction * 100).toFixed(0);
      setQuizResult({
        timeSpent,
        score: `${percentage}%`,
        averageTimePerQuestion,
        correctAnswers: answers.filter((a) => a.isCorrect).length,
        wrongAnswers: answers.filter((a) => !a.isCorrect).length,
        totalQuestions: questions.length,
      });
    }

    const correctCount = answers.filter((a) => a.isCorrect).length;
    try {
      await submitQuiz({
        variables: {
          quizId,
          updateQuizInput: {
            timeSpent: questions.length * 90 - timeRemaining,
            score: correctCount,
            answers: answers.map((a) => ({
              questionId: a.questionId,
              answer: a.answer,
              isCorrect: a.isCorrect,
            })),
          },
        },
      });
      toast({
        variant: "default",
        title: "Quiz Submitted",
        description: "Your quiz was successfully submitted.",
      });
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Something went wrong.",
      });
    }
  };

  // Early return if no questions
  if (!questions || questions.length === 0 || !currentQuestion) {
    return null;
  }

  // Check for quiz result first - this should take priority and replace the quiz
  if (quizResult && index === 0) {
    // Helper functions for formatting
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s < 10 ? "0" : ""}${s}s`;
    };
    const formatAvgTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? "0" : ""}${s} m`;
    };

    // You may want to get these from your data
    const difficulty = "Mixed";
    const type = "Question";

    return (
      <>
        <div className="w-full mx-auto flex flex-col gap-4 sm:p-4 md:p-6">
          {/* Thought Chain Processed - Show completed events */}
          <Streaming forceShow={true} isReviewMode={true} />
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {/* Final Score */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Final Score
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {quizResult.score}
              </span>
              <Percent className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            {/* Total Questions */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Total Questions
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {quizResult.totalQuestions}
              </span>
              <Database className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
            </div>
            {/* Correct Answers */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Correct Answers
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {quizResult.correctAnswers}
              </span>
              <CheckSquare className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            {/* Incorrect Answers */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Incorrect Answers
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {quizResult.wrongAnswers}
              </span>
              <XCircle className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            {/* Time Taken */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Time Taken
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {formatTime(quizResult.timeSpent)}
              </span>
              <Clock className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            {/* Average Time per Question */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Average Time per Question
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {formatAvgTime(quizResult.averageTimePerQuestion)}
              </span>
              <Timer className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
            </div>
            {/* Difficulty */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Difficulty
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {difficulty}
              </span>
              <BarChart className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
            </div>
            {/* Type */}
            <div className="relative p-4 sm:p-5 md:p-6 bg-white rounded-xl shadow-sm border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] md:min-h-[120px]">
              <span className="text-xs sm:text-sm font-normal text-gray-800">
                Type
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2">
                {type}
              </span>
              <FileText className="absolute top-3 right-3 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
            </div>
          </div>
          <div className="mx-auto">
            <Button variant="default">
              <Link href="/dashboard/question-bank">Go to Question Bank</Link>
            </Button>
          </div>

          {/* Question Review Tabs Component */}
          <QuizReviewTabs questions={questions} answers={answers} />
        </div>
      </>
    );
  }

  // Check if this is the current question to display
  if (currentQuestionIndex === index) {
    return (
      <div className="w-full mx-auto flex flex-col gap-4 overflow-x-hidden">
        {/* Timer Header */}
        <div className="p-3 sm:p-4 bg-white border-zinc-200 shadow rounded-md max-w-full">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm text-gray-500">
                {formatTime(timeRemaining)} Remaining
              </span>
            </div>
            <span className="block text-xs sm:text-sm text-gray-500">{`Question ${
              currentQuestionIndex + 1
            } of ${questions.length}`}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-blue-100 rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
        {/* Question Info */}
        <div className="flex flex-col items-start justify-start p-3 sm:p-4 border-b max-w-full overflow-x-hidden">
          <div className="flex items-center flex-wrap gap-2">
            <Badge variant="default" className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium break-words">
                {currentQuestion.topic}
              </span>
            </Badge>
            <Badge variant="plain" className="flex items-center gap-2">
              <span className="text-xs sm:text-sm break-words">
                Question Type:{" "}
              </span>
              <span className="text-xs sm:text-sm font-medium break-words">
                {currentQuestion.question_type}
              </span>
            </Badge>

            <Badge variant="plain" className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">Difficulty: </span>
              <span className="text-xs sm:text-sm font-medium">
                {currentQuestion.level}
              </span>
            </Badge>
          </div>
        </div>
        {/* Question and Choices */}
        <div className="flex items-start w-full max-w-full bg-white rounded-md p-3 sm:p-4 gap-2 shadow border-zinc-200 overflow-x-hidden">
          <div className="w-6 h-6 flex-shrink-0 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <QuestionMarkIcon />
          </div>
          <h3 className="font-medium text-sm sm:text-base break-words overflow-wrap-anywhere">
            {currentQuestion.question}
          </h3>
        </div>
        <RadioGroup value={selectedAnswer}>
          {currentQuestion.choices.map((choice: string, idx: number) => {
            const letter = String.fromCharCode(65 + idx);

            return (
              <div
                key={idx}
                className={`flex items-start gap-2 p-3 sm:p-4 rounded-md bg-white shadow border transition-all duration-200 max-w-full overflow-x-hidden`}
                // to highlight border
                // ${getChoiceStyle(
                //   choice,
                //   idx
                // )}
              >
                <RadioGroupItem
                  value={choice}
                  id={`option-${idx}`}
                  key={idx}
                  onClick={() => handleAnswerSelect(choice, idx)}
                  className="flex-shrink-0 mt-1"
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex items-start cursor-pointer w-full min-w-0"
                >
                  <span className="font-medium mr-2 flex-shrink-0">
                    {letter}.
                  </span>
                  <span className="break-words overflow-wrap-anywhere">
                    {choice}
                  </span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>{" "}
        {/* Answer Feedback and Explanation - shows when answer is selected */}
        {selectedAnswer && showExplanation && (
          <div className="p-3 sm:p-4 border-t max-w-full overflow-x-hidden">
            <EnhancedExplanation
              explanation={currentQuestion.explanation}
              generationTime={currentQuestion.generationTime}
            />
          </div>
        )}
        {/* Navigation buttons */}
        <div className="p-3 sm:p-4 border-t max-w-full overflow-x-hidden">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleSaveQuestion}
                disabled={isSaving || currentQuestion.isSaved}
                className="text-xs sm:text-sm"
              >
                <BookMarked
                  size={16}
                  className={
                    currentQuestion.isSaved
                      ? "text-green-500 fill-green-500"
                      : ""
                  }
                />
                <span className="ml-1">
                  {isSaving
                    ? "Saving..."
                    : currentQuestion.isSaved
                    ? "Saved"
                    : "Save"}
                </span>
              </Button>
              {/* <Button
                variant="outline"
                className="text-primary"
                onClick={handleReviewConcept}
              >
                <Folder size={20} /> Review Concept
              </Button> */}
              <Button
                variant="outline"
                onClick={toggleCitations}
                className="hidden"
              >
                <Eye size={16} /> {showCitations ? "Hide" : "See"} Citations
              </Button>
              {selectedAnswer && (
                <Button
                  variant="outline"
                  onClick={handleToggleExplanation}
                  className="text-primary text-xs sm:text-sm"
                >
                  <Eye size={16} />{" "}
                  <span className="ml-1">
                    {showExplanation ? "Hide" : "Show"} Explanation
                  </span>
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={index === 0}
                aria-disabled={index === 0}
                className="text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={goToNextQuestion}
                disabled={index >= questions.length - 1}
                aria-disabled={index >= questions.length - 1}
                className="text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Next
              </Button>
              {index === questions.length - 1 && (
                <Button
                  onClick={handleSubmitQuiz}
                  className="text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  Submit
                </Button>
              )}
            </div>
          </div>
          {showCitations && citations && (
            <div className="mt-4 bg-white p-3 sm:p-4 rounded-md border-zinc-200 max-w-full overflow-x-hidden">
              <Citations citations={citations} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
