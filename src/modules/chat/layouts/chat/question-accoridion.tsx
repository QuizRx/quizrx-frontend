"use client";

import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import { useMutation } from "@apollo/client";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { BookMarked, Clock, Eye, Folder } from "lucide-react";
import { useEffect } from "react";
import { UPDATE_QUESTION_MUTATION } from "../../apollo/mutation/question";
import {
  useIndividualTimer,
  useIndividualQuestionStore,
} from "../../store/individual-timer-store";
import { useSplitView } from "../../store/split-view-store"; // Added this import
import { Citation, SenderType, MessageType } from "../../types/api/messages";
import { Question } from "../../types/api/question";
import { Citations } from "./message-content-renderer";
import { useChat } from "../../store/chat-store";
import { useAvatarStore } from "../../store/avatar-store";
import { EnhancedExplanation } from "../../components/EnhancedExplanation";

export default function QuestionAccordion({
  questions,
  totalTime = 90,
  citations,
}: {
  questions: Question[];
  totalTime?: number;
  citations?: Citation[];
}) {
  const [updateQuestion] = useMutation(UPDATE_QUESTION_MUTATION);
  const { handleSubmit, messages } = useChat(); // Added messages here
  const { setReviewMode } = useSplitView(); // Added this hook
  const { talk, showAvatarWithContext } = useAvatarStore(); // Added avatar store hook

  // Get the first question to create a unique identifier
  const currentQuestion = questions[0];
  const questionId = currentQuestion?._id || "fallback-id";

  // Get the individual store instance for this specific question
  const useQuestionStore = useIndividualQuestionStore(questionId);

  // Timer hook for this specific question
  useIndividualTimer(questionId);

  // Zustand store selectors for this individual question
  const {
    // State
    question,
    isAnswered,
    timeRemaining,
    selectedAnswer,
    showCitations,
    showExplanation,
    isSaving,

    // Actions
    initializeQuestion,
    selectAnswer,
    toggleCitations,
    toggleExplanation,
    saveQuestion,
    formatTime,
    getChoiceStyle,
    showQuestion,
  } = useQuestionStore();

  // Initialize question when component mounts or questions change
  useEffect(() => {
    if (currentQuestion) {
      if (currentQuestion.userChoice === null) {
        // New question to answer
        initializeQuestion(currentQuestion, totalTime);
      } else {
        // Previously answered question to review
        showQuestion(currentQuestion, totalTime);
      }
    }
  }, [currentQuestion, totalTime, initializeQuestion, showQuestion]);

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

  // Enhanced handleToggleExplanation with avatar speech
  const handleToggleExplanation = async () => {
    if (!question) return;

    const wasHidden = !showExplanation;
    toggleExplanation();

    // If explanation was just shown, make avatar speak it
    if (wasHidden && question.explanation) {
      let explanationText = "";
      if (typeof question.explanation === "string") {
        explanationText = question.explanation;
      } else {
        explanationText = `Correct answer: ${question.explanation.correct_answer.explanation}`;
      }

      await talk(
        `Your goal is to explain for the user the explanation, be more educative as possible, Here's the question: ${question.question}. This is the answer: ${question.answer}. This is the explanation: ${explanationText}`,
        "chat"
      );
    }
  };

  // Event handlers
  const handleSaveQuestion = async () => {
    if (!question) return;

    try {
      await saveQuestion(updateQuestion);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    selectAnswer(answer, updateQuestion);
  };
  // Updated handleReviewConcept function to trigger split view and avatar speech
  const handleReviewConcept = async () => {
    if (!question) return;

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

  // Early return if no questions
  if (!questions || questions.length === 0 || !question) {
    return null;
  }

  const renderAnswerFeedback = () => {
    if (!selectedAnswer) return null;

    // Find the correct answer by comparing choice text with the stored answer
    const correctAnswerIndex = question.choices.findIndex(
      (choice: string) => choice === question.answer
    );
    const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex);

    const selectedAnswerLetter = selectedAnswer.toUpperCase();
    const selectedAnswerIndex = selectedAnswerLetter.charCodeAt(0) - 65;
    const selectedAnswerText = question.choices[selectedAnswerIndex];

    const isCorrect = selectedAnswerLetter === correctAnswerLetter;

    return (
      <>
        {!isCorrect && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
            <div className="mb-4">
              <h4 className="font-medium text-red-600 mb-2">
                ✗ Incorrect Answer:
              </h4>
              <p className="text-sm text-red-600">
                <span className="font-bold">{selectedAnswerLetter}:</span>{" "}
                {selectedAnswerText}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium text-green-600 mb-2">
                ✓ Correct Answer:
              </h4>
              <p className="text-sm text-green-600">
                <span className="font-bold">{correctAnswerLetter}:</span>{" "}
                {question.answer}
              </p>
            </div>
          </div>
        )}
        {isCorrect && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
            <h4 className="font-medium text-green-600 mb-2">✓ Correct!</h4>
            <p className="text-sm text-green-600">
              <span className="font-bold">{correctAnswerLetter}:</span>{" "}
              {question.answer}
            </p>
          </div>
        )}
      </>
    );
  };

  const renderExplanation = () => {
    return (
      <div className="p-4 bg-white border border-zinc-200 rounded-md">
        <h4 className="font-medium mb-2">Explanation:</h4>
        <EnhancedExplanation
          explanation={question.explanation}
          generationTime={question.generationTime}
        />
      </div>
    );
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-4 overflow-x-hidden">
      {/* Timer Header */}
      {isAnswered ? (
        <>
          <div className="p-3 sm:p-4 bg-white border-zinc-200 shadow rounded-md max-w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span className="text-sm font-medium">
                  Answered in {formatTime(question?.timeSpent || 0)}
                </span>
              </div>
              <span className="block text-sm text-gray-500">
                Question 1 of 1
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-blue-100 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="p-3 sm:p-4 bg-white border-zinc-200 shadow rounded-md max-w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span className="text-sm font-medium">
                  {formatTime(timeRemaining)} Remaining
                </span>
              </div>
              <span className="block text-sm text-gray-500">
                Question 1 of 1
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-blue-100 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </>
      )}

      {/* Question Info */}
      <div className="flex flex-col items-start justify-start p-3 sm:p-4 border-b max-w-full overflow-x-hidden">
        {/* <div className="flex items-center space-x-4"> */}
        <div className="flex items-center flex-wrap gap-2">
          <Badge variant="plain" className="flex flex-col items-center gap-2">
            <span className="text-xs sm:text-sm font-medium break-words">
              {question.topic}
            </span>
          </Badge>
          <Badge variant="plain" className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium break-words">
              {question.sub_topic}
            </span>
          </Badge>
        </div>
        <div className="flex items-center flex-wrap gap-2 mt-2">
          <Badge variant="plain" className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">Question Type: </span>
            <span className="text-xs sm:text-sm font-medium break-words">
              {question.question_type}
            </span>
          </Badge>

          <Badge variant="plain" className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">Difficulty: </span>
            <span className="text-xs sm:text-sm font-medium">
              {question.level}
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
          {question.question}
        </h3>
      </div>

      <RadioGroup value={selectedAnswer || ""}>
        {question.choices.map((choice: string, idx: number) => (
          <div
            key={idx}
            className={`flex items-start gap-2 p-3 sm:p-4 rounded-md bg-white shadow border transition-all duration-200 max-w-full overflow-x-hidden ${getChoiceStyle(
              choice,
              idx
            )}`}
          >
            <RadioGroupItem
              value={String.fromCharCode(65 + idx)}
              id={`option-${idx}`}
              key={idx}
              onClick={() => handleAnswerSelect(String.fromCharCode(65 + idx))}
              disabled={selectedAnswer !== null}
              className="flex-shrink-0 mt-1"
            />
            <Label
              htmlFor={`option-${idx}`}
              className="flex items-start cursor-pointer w-full min-w-0"
            >
              <span className="font-medium mr-2 flex-shrink-0">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span className="break-words overflow-wrap-anywhere">
                {choice}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Answer Feedback and Explanation - shows when answer is selected */}
      {selectedAnswer && showExplanation && (
        <>
          {renderAnswerFeedback()}
          {renderExplanation()}
        </>
      )}

      {/* Show Explanation button when answer is selected but explanation is hidden */}

      {/* Navigation buttons */}
      <div className="p-3 sm:p-4 border-t max-w-full overflow-x-hidden">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleSaveQuestion}
              disabled={isSaving || question.isSaved}
              className="text-xs sm:text-sm"
            >
              <BookMarked
                size={16}
                className={
                  question.isSaved ? "text-green-500 fill-green-500" : ""
                }
              />
              <span className="ml-1">
                {isSaving ? "Saving..." : question.isSaved ? "Saved" : "Save"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="text-primary text-xs sm:text-sm"
              onClick={handleReviewConcept}
            >
              <Folder size={16} /> <span className="ml-1">Review</span>
            </Button>
            <Button
              variant="outline"
              onClick={toggleCitations}
              className="hidden"
            >
              <Eye /> {showCitations ? "Hide" : "See"} Citations
            </Button>{" "}
            {selectedAnswer && isAnswered && (
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
