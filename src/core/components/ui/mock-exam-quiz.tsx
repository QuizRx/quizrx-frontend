import React, { useState, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { useQuery, useMutation } from "@apollo/client";
import { GET_QUESTIONS_BY_QUESTION_BANK_ID_QUERY } from "@/modules/chat/apollo/query/question";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/core/components/ui/card";
import { ChevronLeft, ChevronRight, ArrowLeft, Timer } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import { Label } from "@/core/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import QuestionQuickNav from "@/core/components/ui/QuestionQuickNav";
import MockExamResults from "@/core/components/ui/mock-exam-results";
import { toast } from "@/core/hooks/use-toast";
import { GET_QUESTIONS_BY_IDS_QUERY } from "@/modules/chat/apollo/query/question";
import { CREATE_MOCK_EXAM_HISTORY } from "@/modules/chat/apollo/mutation/mock-exam-history";
interface MockExamQuizProps {
  questionIds: string[];
  setIsStartedMockExam: (value: boolean) => void;
  mockExamId: string | undefined;
  currentExam: any;
  refetchMockExamsHistory: () => void;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  difficulty: string;
  type: string;
}

// Interface for tracking user answers
interface UserAnswers {
  [questionIndex: number]: string;
}

const MockExamQuiz = ({
  questionIds,
  setIsStartedMockExam,
  mockExamId,
  currentExam,
  refetchMockExamsHistory,
}: MockExamQuizProps) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Will be set based on total questions
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // State to hold all user answers
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});

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

  const [createMockExamHistory, { loading: isCreatingMockExamHistory }] =
    useMutation(CREATE_MOCK_EXAM_HISTORY);

  // Get questions data
  const questions = questionsData?.getQuestionsByIds || [];

  // Initialize total exam time (90 seconds per question)
  useEffect(() => {
    if (questions.length > 0 && timeLeft === 0) {
      const totalTime = questions.length * 90; // 90 seconds per question
      setTimeLeft(totalTime);
    }
  }, [questions.length, timeLeft]);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || !questions.length || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up - end exam
          setIsTimerRunning(false);
          handleSubmitExam();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, questions.length, showResults]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format average time per question
  const formatAvgTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get timer color based on time remaining
  const getTimerColor = (timeLeft: number) => {
    if (timeLeft <= 10) return "text-red-500";
    if (timeLeft <= 30) return "text-yellow-500";
    return "text-white";
  };

  // Function to save user answer
  const saveUserAnswer = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  // Function to get user answer for a specific question
  const getUserAnswer = (questionIndex: number): string | null => {
    return userAnswers[questionIndex] || null;
  };

  // Function to calculate actual results based on user answers
  const calculateResults = (): QuizResult => {
    let correctAnswers = 0;
    let answeredQuestions = 0;

    questions.forEach((question: any, index: number) => {
      const userAnswer = userAnswers[index];
      if (userAnswer) {
        answeredQuestions++;
        if (userAnswer === question.answer) {
          correctAnswers++;
        }
      }
    });

    const score =
      answeredQuestions > 0
        ? Math.round((correctAnswers / answeredQuestions) * 100)
        : 0;
    const timeSpent = questions.length * 90 - timeLeft;

    return {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers: answeredQuestions - correctAnswers,
      timeSpent,
      averageTimePerQuestion:
        answeredQuestions > 0 ? Math.floor(timeSpent / answeredQuestions) : 0,
      difficulty: "Intermediate",
      type: "Mock Exam",
    };
  };

  const handleSubmitExam = async () => {
    // if the userAnswers object length is not equal to the questions length, then show a toast error
    if (Object.keys(userAnswers).length !== questions.length) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You need to answer all questions before submitting",
      });
      return;
    }

    setIsTimerRunning(false);

    // Calculate actual results based on user answers
    const actualResult = calculateResults();
    console.log(actualResult, "actualResult");
    setQuizResult(actualResult);
    setShowResults(true);

    await createMockExamHistory({
      variables: {
        input: {
          title: currentExam.title,
          mockExamId: mockExamId ?? "",
          questionIds: questionIds,
          answers: Object.entries(userAnswers).map(
            ([questionIndex, answer]) => ({
              questionId: questionIds[Number(questionIndex)],
              answer,
              isCorrect: answer === questions[Number(questionIndex)].answer,
            })
          ),
          timeSpent: (questions.length * 90) - timeLeft,
          score: actualResult.score,
        },
      },
    });

    console.log(userAnswers, "userAnswers");
  };

  if (questionsLoading) {
    return (
      <div className="bg-transparent min-h-[90vh] w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  const handleBackToMockExams = () => {
    setIsStartedMockExam(false);
    refetchMockExamsHistory();
    router.push("/dashboard/mock-exams");
  };

  if (!questionsData) {
    return (
      <div className="bg-transparent min-h-[90vh] w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Questions not found
          </h2>
          <p className="text-gray-600 mb-6">
            No questions available for this question bank.
          </p>
          <Button
            onClick={handleBackToMockExams}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mock Exams
          </Button>
        </div>
      </div>
    );
  }

  // Show results if exam is completed
  if (showResults && quizResult) {
    return (
      <MockExamResults
        quizResult={quizResult}
        onBackToMockExams={handleBackToMockExams}
        onRetakeExam={() => {
          setShowResults(false);
          setCurrentQuestionIndex(0);
          setTimeLeft(questions.length * 90);
          setIsTimerRunning(true);
          setUserAnswers({}); // Reset user answers
        }}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentUserAnswer = getUserAnswer(currentQuestionIndex);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerSelect = (newAnswer: string) => {
    saveUserAnswer(currentQuestionIndex, newAnswer);
  };

  return (
    <div className="bg-transparent min-h-[90vh] w-full flex">
      <div className="flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex items-start mt-4 ml-4 cursor-pointer"
              onClick={handleBackToMockExams}
            >
              <ArrowLeft className="h-8 w-8" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Back to Mock Exams selection</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        {/* Progress Bar Section */}
        <div className="w-full flex flex-col items-center">
          {/* Blue header */}
          <div className="w-full max-w-4xl h-16 bg-primary rounded-t-2xl">
            <div className="flex items-center justify-between px-4 h-full">
              <span className="text-white text-lg">Mock Exam</span>
              <div className="flex items-center gap-2 border border-white rounded-md px-2 py-1">
                <Timer className="w-5 h-5 text-white" />
                <span
                  className={`text-lg font-mono ${getTimerColor(timeLeft)}`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          {/* Card with progress */}
          <div className="w-full max-w-4xl -mt-2 rounded-b-2xl shadow-lg bg-white">
            <div className="px-6 pt-4 pb-6">
              <div className="text-gray-600 text-base font-medium mb-2">
                Progress: {Object.keys(userAnswers).length} of{" "}
                {questions.length} Answered
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      questions.length
                        ? (Object.keys(userAnswers).length / questions.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* End Progress Bar Section */}

        {/* Question Content */}
        <div className="flex-1 flex flex-col items-center space-y-6">
          {currentQuestion && (
            <>
              <Card className="w-full max-w-4xl rounded-lg border-gray-200">
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Question {currentQuestionIndex + 1}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.question_type}
                      </Badge>
                    </div>
                  </div>

                  {/* Question Info */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4 mb-2">
                      <Badge variant="plain" className="text-xs">
                        {currentQuestion.topic}
                      </Badge>
                      {currentQuestion.sub_topic && (
                        <Badge variant="plain" className="text-xs">
                          {currentQuestion.sub_topic}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">Question:</h4>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Choices */}
              <div className="w-full max-w-4xl">
                <RadioGroup
                  value={currentUserAnswer || ""}
                  onValueChange={handleAnswerSelect}
                >
                  <div className="space-y-3">
                    {currentQuestion.choices.map(
                      (choice: string, idx: number) => {
                        const letter = String.fromCharCode(65 + idx);

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-4 rounded-md bg-white shadow border transition-all duration-200 hover:bg-gray-50"
                          >
                            <RadioGroupItem
                              value={choice}
                              id={`option-${idx}`}
                            />
                            <Label
                              htmlFor={`option-${idx}`}
                              className="flex items-center cursor-pointer w-full"
                            >
                              <span className="font-medium mr-2">
                                {letter}.
                              </span>
                              <span>{choice}</span>
                            </Label>
                          </div>
                        );
                      }
                    )}
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </div>
        {/* Navigation Footer */}
        <div className="bg-white p-4 border-t border-gray-200 w-full max-w-4xl mt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center min-w-[300px] max-w-[340px] w-full pt-6 pr-4">
        {/* Quick Navigation */}
        <QuestionQuickNav
          totalQuestions={questions.length}
          currentIndex={currentQuestionIndex}
          onNavigate={setCurrentQuestionIndex}
          userAnswers={userAnswers}
        />
        {/* Submit and End Exam buttons */}
        <Button
          className="w-full mt-4 bg-green-600 hover:bg-green-700"
          onClick={handleSubmitExam}
        >
          Submit Exam
        </Button>
        <Button
          variant="outline"
          className="w-full mt-2 border-red-500 text-red-600 hover:bg-red-50"
          onClick={handleBackToMockExams}
        >
          End Exam
        </Button>
      </div>
    </div>
  );
};

export default MockExamQuiz;
