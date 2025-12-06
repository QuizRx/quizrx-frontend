"use client";

import { DotPulse } from "ldrs/react";
import "ldrs/react/DotPulse.css";
import {
  Copy,
  Download,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { useChat } from "../../store/chat-store";
import { useSplitView } from "../../store/split-view-store";
import { useAvatarStore } from "../../store/avatar-store";
import { Message, MessageType, SenderType } from "../../types/api/messages";
import {
  ContentWithCitations,
  StreamingContentWithCitations,
} from "./message-content-renderer";
import QuestionAccordion from "./question-accoridion";
import QuizAccordion from "./quiz-accordion";
import { SplitView } from "./split-view";
import { GET_QUIZ_BY_ID_QUERY } from "../../apollo/query/quiz";
import { useQuery } from "@apollo/client";
import { StreamedProcess } from "./streamed-process";
import { Streaming } from "./streaming";

export const ChatLayout = () => {
  const { messages, handleMessageAction, isLoading, lastStreamingMessageId } =
    useChat();

  const { isReviewMode, toggleReviewMode } = useSplitView();
  const { talk, showAvatar, isAvatarVisible, showAvatarWithContext } =
    useAvatarStore();

  // Helper function to get current question context from messages
  const getCurrentQuestionContext = () => {
    // Find the latest question message
    const questionMessages = messages.filter(
      (message) => message.senderType === SenderType.AI && message.questions
    );

    if (questionMessages.length === 0) return null;

    const latestQuestionMessage = questionMessages[questionMessages.length - 1];
    const qAny = latestQuestionMessage.questions as any;
    const question = Array.isArray(qAny) ? qAny[0] : qAny;

    if (!question) return null;

    // Find any review concept messages
    const reviewConceptStartIndex = messages.findIndex(
      (message) =>
        message.senderType === SenderType.USER &&
        message.content?.includes(
          "Help me understand the question and provided feedback"
        )
    );

    const reviewContent =
      reviewConceptStartIndex !== -1
        ? messages
            .slice(reviewConceptStartIndex)
            .filter(
              (msg) =>
                msg.senderType === SenderType.AI &&
                msg.messageType === MessageType.ANSWER
            )
            .map((msg) => msg.content)
            .join(" ")
        : undefined;

    return {
      question: question.question,
      answer: question.answer,
      explanation: question.explanation,
      selectedAnswer:
        question.userChoice !== null && question.userChoice !== undefined
          ? String.fromCharCode(65 + (question.userChoice as number))
          : undefined,
      isCorrect: question.isUserAnswerCorrect,
      reviewContent,
    };
  };

  // Enhanced function to handle avatar reading the message with context
  const handleAvatarRead = async (messageContent: string) => {
    const context = getCurrentQuestionContext();

    if (context) {
      // Show avatar with context and let it provide contextual explanation
      showAvatarWithContext({
        ...context,
        reviewContent: messageContent, // Add the specific message as review content
      });
    } else {
      // Fallback to simple avatar show
      if (!isAvatarVisible) showAvatar();
      await talk(
        `Your goal is to read this message for the user in the most educative way, mostly this messages are answers to questions: ${messageContent}`,
        "chat"
      );
    }
  };

  const isQuizPattern =
    messages.length > 1 &&
    messages[0].senderType === "AI" &&
    messages[1].senderType === "AI";

  // Get the quiz/question messages for left panel
  const quizMessages = messages.filter(
    (message: Message) =>
      message.senderType === SenderType.AI && message.questions
  );

  // Get only Review Concept related messages for right panel
  // Find the index where "Review Concept" was clicked (look for the specific prompt)
  const reviewConceptStartIndex = messages.findIndex(
    (message: Message) =>
      message.senderType === SenderType.USER &&
      message.content?.includes(
        "Help me understand the question and provided feedback"
      )
  );

  // Only include messages from the Review Concept conversation onwards
  const reviewConceptMessages =
    reviewConceptStartIndex !== -1
      ? messages.slice(reviewConceptStartIndex).filter((message: Message) => {
          // Include the user query
          if (message.senderType === SenderType.USER) {
            return true;
          }

          // Include AI responses that are answers (not quiz questions)
          if (message.senderType === SenderType.AI) {
            return (
              message.messageType === MessageType.ANSWER ||
              (message.content && !message.questions)
            );
          }

          return false;
        })
      : [];

  // console.log("All messages:", messages);
  // console.log("Review Concept Messages:", reviewConceptMessages);
  // console.log("Review Concept Start Index:", reviewConceptStartIndex);
  // console.log(
  //   "Messages from start index:",
  //   reviewConceptStartIndex !== -1
  //     ? messages.slice(reviewConceptStartIndex)
  //     : []
  // );

  const quizId = messages[0]?.quizId;

  const { data, error, loading, refetch } = useQuery(GET_QUIZ_BY_ID_QUERY, {
    variables: quizId ? { id: quizId } : undefined,
    fetchPolicy: "cache-first", // Changed from network-only for better performance
    skip: !quizId,
  });

  const fetchedQuiz = data?.getQuizById;

  // Render all messages together (default view - no split)
  const renderAllMessages = () => (
    <div className="w-full space-y-4 sm:space-y-6 pt-2 px-2 sm:px-4 h-full overflow-x-hidden">
      {messages.map((message: Message, index: number) => (
        <div
          key={message._id}
          className={`${
            message.senderType === SenderType.USER ? "text-right" : "text-left"
          } mb-4 sm:mb-6 max-w-full`}
        >
          <div
            className={`inline-block w-full max-w-full p-2 sm:p-4 rounded-l-lg rounded-t-lg break-words text-sm md:text-base ${
              message.senderType === SenderType.USER
                ? "bg-card text-card-foreground"
                : "bg-transparent text-foreground"
            }`}
          >
            {message.senderType === SenderType.USER ? (
              <>
                {message.messageType === MessageType.QUERY && (
                  <p>{message.content}</p>
                )}
                {/* { message.messageType === MessageType.FORM_TOPIC && (<FormTopics />)} */}
              </>
            ) : (
              <>
                {message.agentEvents &&
                  message.agentEvents.length > 0 &&
                  !isQuizPattern && (
                    <StreamedProcess
                      agentEvents={message.agentEvents}
                      isStreaming={message._id === lastStreamingMessageId}
                      generationTime={
                        message.questions && message.questions.length > 0
                          ? message.questions[0].generationTime
                          : undefined
                      }
                      isReviewMode={(() => {
                        const hasQuestions =
                          message.questions && message.questions.length > 0;
                        if (!hasQuestions || !message.questions) return false;

                        const userChoice = message.questions[0].userChoice;
                        const isAnswered =
                          userChoice !== undefined && userChoice !== null;
                        return isAnswered;
                      })()}
                    />
                  )}
                {/* Message content with citation support */}
                {(() => {
                  if (
                    message.messageType === MessageType.QUIZ &&
                    message.questions &&
                    message.questions.length > 0
                  ) {
                    return (
                      <div className="w-full">
                        {isQuizPattern ? (
                          <QuizAccordion
                            index={index}
                            citations={message.citations}
                            questions={messages
                              .map((q: any) => q.questions?.[0])
                              .filter(Boolean)}
                            quizId={quizId}
                            fetchedQuiz={fetchedQuiz}
                          />
                        ) : (
                          <QuestionAccordion
                            citations={message.citations}
                            questions={message.questions}
                          />
                        )}
                      </div>
                    );
                  } else if (message.messageType === MessageType.ANSWER) {
                    return message._id === lastStreamingMessageId ? (
                      <StreamingContentWithCitations
                        message={message.content!}
                        citations={message.citations}
                      />
                    ) : (
                      <ContentWithCitations
                        content={message.content!}
                        citations={message.citations}
                      />
                    );
                  } else {
                    return null;
                  }
                })()}

                {/* Message interaction buttons - only for regular answers */}
                {message.messageType === MessageType.ANSWER && (
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                    {" "}
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                      onClick={() =>
                        handleMessageAction("rewrite", message._id)
                      }
                    >
                      <RefreshCcw size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                      onClick={() => handleMessageAction("like", message._id)}
                    >
                      <ThumbsUp size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                      onClick={() => handleMessageAction("unlike", message._id)}
                    >
                      <ThumbsDown size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                      onClick={() =>
                        handleMessageAction("download", message._id)
                      }
                    >
                      <Download size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                      onClick={() => handleMessageAction("copy", message._id)}
                    >
                      <Copy size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      className="text-blue-900 hover:text-primary transition-colors p-1.5 sm:p-2"
                      onClick={() => handleAvatarRead(message.content || "")}
                      title="Have avatar read and explain this message"
                    >
                      <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {/* Loading indicator with DotPulse */}
      <Streaming />
    </div>
  );

  // Render quiz content for left panel (split view)
  const renderQuizContent = () => (
    <div className="w-full h-full overflow-y-auto split-panel-scroll p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Question</h3>
          {/* <button
            onClick={toggleReviewMode}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
          >
            Exit Split View
          </button> */}
        </div>
        {quizMessages.map((message: Message, index: number) => (
          <div key={message._id} className="w-full">
            {message.questions &&
              (isQuizPattern ? (
                <QuizAccordion
                  index={index}
                  citations={message.citations}
                  questions={quizMessages
                    .map((q: any) => q.questions?.[0])
                    .filter(Boolean)}
                />
              ) : (
                <QuestionAccordion
                  citations={message.citations}
                  questions={
                    Array.isArray(message.questions)
                      ? message.questions
                      : [message.questions]
                  }
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );

  // Render ONLY Review Concept conversation for right panel (split view)
  const renderReviewConceptContent = () => (
    <div className="w-full h-full overflow-y-auto split-panel-scroll p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Concept Review</h3>
        {reviewConceptMessages.length > 0 ? (
          reviewConceptMessages.map((message: Message, index: number) => (
            <div
              key={message._id}
              className={`${
                message.senderType === SenderType.USER
                  ? "text-right"
                  : "text-left"
              } mb-4`}
            >
              {message.agentEvents &&
                message.agentEvents.length > 0 &&
                !isQuizPattern && (
                  <StreamedProcess
                    agentEvents={message.agentEvents}
                    isStreaming={message._id === lastStreamingMessageId}
                    generationTime={
                      message.questions && message.questions.length > 0
                        ? message.questions[0].generationTime
                        : undefined
                    }
                    isReviewMode={(() => {
                      const hasQuestions =
                        message.questions && message.questions.length > 0;
                      if (!hasQuestions || !message.questions) return false;

                      const userChoice = message.questions[0].userChoice;
                      const isAnswered =
                        userChoice !== undefined && userChoice !== null;
                      return isAnswered;
                    })()}
                  />
                )}
              <div
                className={`inline-block max-w-full p-4 rounded-lg ${
                  message.senderType === SenderType.USER
                    ? "bg-card text-card-foreground"
                    : "bg-transparent text-foreground"
                }`}
              >
                {message.senderType === SenderType.USER ? (
                  <p>{message.content}</p>
                ) : (
                  <>
                    {message._id === lastStreamingMessageId ? (
                      <StreamingContentWithCitations
                        message={message.content!}
                        citations={message.citations}
                      />
                    ) : (
                      <ContentWithCitations
                        content={message.content!}
                        citations={message.citations}
                      />
                    )}

                    {/* Message interaction buttons */}
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                      {" "}
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                        onClick={() =>
                          handleMessageAction("rewrite", message._id)
                        }
                      >
                        <RefreshCcw size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                        onClick={() => handleMessageAction("like", message._id)}
                      >
                        <ThumbsUp size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                        onClick={() =>
                          handleMessageAction("unlike", message._id)
                        }
                      >
                        <ThumbsDown size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                        onClick={() =>
                          handleMessageAction("download", message._id)
                        }
                      >
                        <Download size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2"
                        onClick={() => handleMessageAction("copy", message._id)}
                      >
                        <Copy size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        className="text-blue-900 hover:text-primary transition-colors p-1.5 sm:p-2"
                        onClick={() => handleAvatarRead(message.content || "")}
                        title="Have avatar read and explain this message"
                      >
                        <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-center py-8">
            Click "Review Concept" on a question to start the conversation.
          </div>
        )}

        {/* Loading indicator for review concept side */}
        {isLoading && reviewConceptMessages.length > 0 && (
          <div className="text-left">
            <div className="inline-flex items-center p-4 rounded-lg bg-transparent">
              <DotPulse size="50" speed="1.3" color="var(--primary)" />
              <span className="ml-3 text-muted-foreground">Generating...</span>
            </div>
          </div>
        )}
      </div>
      <Streaming />
    </div>
  );

  // Only split when review mode is enabled AND there are review concept messages
  if (
    isReviewMode &&
    quizMessages.length > 0 &&
    reviewConceptMessages.length > 0
  ) {
    return (
      <div className="w-full h-full">
        <SplitView
          leftContent={renderQuizContent()}
          rightContent={
            // <div className="relative w-full h-full">
            //   {isAvatarVisible && (
            //     <PlacedAvatar
            //       question={constantQuestion}
            //       onClose={hideAvatar}
            //       occupySpace={true}
            //     />
            //   )}
            renderReviewConceptContent()
            // </div>
          }
          isOpen={isReviewMode}
          onToggle={toggleReviewMode}
          defaultLeftWidth={40}
        />
      </div>
    );
  }

  // Default: show all messages together (including quiz) - no split
  return (
    <div className="w-full max-w-5xl flex flex-col">
      {renderAllMessages()}
      {/* <pre>
        {JSON.stringify(messages, null, 2)}
      </pre> */}
    </div>
  );
};
