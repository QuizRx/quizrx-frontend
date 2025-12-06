"use client";

import { Separator } from "@/core/components/ui/separator";
import { toast } from "@/core/hooks/use-toast";
import { GET_USER_QUESTION_BANKS_QUERY } from "@/modules/chat/apollo/query/question-bank";
import PageFilterHeader from "@/modules/chat/components/shared/page-filter";
import { mockExamHistoryColumns } from "@/modules/chat/components/columns/mock-exam-history";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  Play,
  Target,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { FIND_MOCK_EXAMS_BY_USER_ID_QUERY } from "@/modules/chat/apollo/query/mock-exam";
import { GET_MOCK_EXAMS_HISTORY } from "@/modules/chat/apollo/query/mock-exam-history";
import PageTitle from "@/core/layouts/common/page-title";
import MockExamQuiz from "@/core/components/ui/mock-exam-quiz";
import { DataTable } from "@/core/components/table";
import { useSearchParams } from "next/navigation";

const getDifficultyStyle = (difficulty: string) => {
  const styles = {
    Foundation: "bg-blue-50 text-blue-700 border border-blue-200",
    Intermediate: "bg-blue-100 text-blue-800 border border-blue-300",
    Advanced: "bg-blue-200 text-blue-900 border border-blue-400",
    Expert: "bg-blue-300 text-blue-950 border border-blue-500",
  };
  return (
    styles[difficulty as keyof typeof styles] ||
    "bg-blue-50 text-blue-700 border border-blue-200"
  );
};

export default function Page() {
  const [currentExam, setCurrentExam] = useState(0);
  const [isStartedMockExam, setIsStartedMockExam] = useState(false);

  const [questionIds, setQuestionIds] = useState<string[]>([]);

  const {
    data: mockExamsData,
    error: mockExamsError,
    refetch: mockExamsRefetch,
    loading: isLoadingMockExams,
  } = useQuery(FIND_MOCK_EXAMS_BY_USER_ID_QUERY, {
    // Use cache-first for better performance on subsequent visits
    fetchPolicy: "cache-first",
  });

  const searchParams = useSearchParams();
  const mockExamIdParam = searchParams.get("mockExamId");

  useEffect(() => {
    if (mockExamIdParam) {
      setCurrentExam(
        mockExamsData?.findMockExamsByUserId.findIndex(
          (exam: any) => exam._id === mockExamIdParam
        ) ?? 0
      );
      setQuestionIds(
        mockExamsData?.findMockExamsByUserId.find(
          (exam: any) => exam._id === mockExamIdParam
        )?.questionIds ?? []
      );
      setIsStartedMockExam(true);
    }
  }, [mockExamIdParam, mockExamsData]);

  const {
    data: mockExamsHistoryData,
    error: mockExamsHistoryError,
    refetch: refetchMockExamsHistory,
    loading: isLoadingMockExamsHistory,
  } = useQuery(GET_MOCK_EXAMS_HISTORY, {
    // Use cache-first for better performance on subsequent visits
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    const exams = mockExamsData?.findMockExamsByUserId ?? [];

    setQuestionIds(exams[currentExam]?.questionIds ?? []);
  }, [mockExamsData, currentExam]);

  if (mockExamsError) {
    toast({
      title: "Error",
      description: mockExamsError.message || "Failed to load collections",
      variant: "destructive",
    });
    return <div>Error loading collections: {mockExamsError.message}</div>;
  }

  // Create mock exams from real data; default to empty array for strict typing
  const allExams = (mockExamsData?.findMockExamsByUserId ?? []).map(
    (exam: any, index: number) => ({
      id: exam._id,
      title: exam.title,
      subtitle: "Custom Question Bank",
      edition: `Collection ${index + 1}`,
      duration: exam.questionIds.length * 90,
      questions: Array.isArray(exam.questionIds) ? exam.questionIds.length : 0,
      passingScore: 70,
      attempts: 0,
      successRate: 0,
      rating: 0,
      lastUpdated: "Just created",
      featured: false,
      gradient: "from-blue-400 via-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    })
  );

  // If no exams available, show loading or empty state
  if (allExams.length === 0) {
    return (
      <div className="mx-auto px-4 py-6 bg-transparent flex flex-col h-[90vh]">
        <PageTitle
          title="Endocrinology Mock Exams"
          description="Comprehensive practice exams covering core endocrinology knowledge."
        />
        <Separator />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No mock exams available</p>
            <p className="text-sm text-gray-500">
              Create some question banks to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nextExam = () => {
    setCurrentExam((prev) => (prev + 1) % allExams.length);
  };

  const prevExam = () => {
    setCurrentExam((prev) => (prev - 1 + allExams.length) % allExams.length);
  };

  const currentExamData = allExams[currentExam] || allExams[0];

  const handleStartMockExam = () => {
    setIsStartedMockExam(true);
  };

  if (isStartedMockExam) {
    return (
      <MockExamQuiz
        setIsStartedMockExam={setIsStartedMockExam}
        questionIds={questionIds}
        // questionIds={questionIds.slice(0, 2)}
        mockExamId={mockExamsData?.findMockExamsByUserId[currentExam]._id}
        currentExam={mockExamsData?.findMockExamsByUserId[currentExam]}
        refetchMockExamsHistory={refetchMockExamsHistory}
      />
    );
  }

  if (isLoadingMockExams) {
    return (
      <div className="mx-auto px-4 py-6 bg-transparent flex flex-col h-[90vh]">
        <PageFilterHeader
          title="EBEEDM Mock Exams"
          description="Practice exams for the European Board Examination in Endocrinology, Diabetes and Metabolism."
        />
        <Separator />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded-3xl w-full max-w-4xl h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-6 bg-transparent flex flex-col min-h-[90vh]">
      <div className="flex items-center justify-between">
        <PageTitle
          title="Endocrinology Mock Exams"
          description="Comprehensive practice exams covering core endocrinology knowledge."
        />

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevExam}
            className="h-10 w-10 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextExam}
            className="h-10 w-10 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Single Exam Display */}
      <div className="flex-1 flex items-center justify-center pt-2">
        <div className="w-full max-w-4xl">
          {/* Exam Card */}
          <div
            className={`relative ${currentExamData.bgGradient} rounded-3xl shadow-md overflow-hidden border border-white/20`}
          >
            {/* Header Gradient */}
            <div
              className={`h-3 bg-gradient-to-r ${currentExamData.gradient}`}
            ></div>

            <div className="p-6">
              {/* Top Section */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  {/* {currentExamData.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )} */}
                  <Badge
                    className={`px-3 py-1 ${getDifficultyStyle(
                      currentExamData.edition
                    )}`}
                  >
                    {currentExamData.edition}
                  </Badge>
                </div>

                {/* <div className="flex items-center gap-2 text-lg text-gray-600">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{currentExamData.rating}</span>
                </div> */}
              </div>

              {/* Title Section */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentExamData.title}
                </h1>
                <p className="text-xl text-gray-600 font-medium">
                  {currentExamData.subtitle}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center justify-center mb-3">
                    <BookOpen className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {currentExamData.questions}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    Questions
                  </div>
                </div>

                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center justify-center mb-3">
                    <Clock className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {Math.ceil((currentExamData?.duration || 0) / 60)} min
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    Duration
                  </div>
                </div>

                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="h-8 w-8 text-gray-700" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {currentExamData.passingScore}%
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    Pass Score
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="flex items-center justify-center gap-8 mb-12 text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">
                    {currentExamData.attempts.toLocaleString()} attempts
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="font-medium">
                  Updated {currentExamData.lastUpdated}
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <Button
                  onClick={handleStartMockExam}
                  size="lg"
                  className={`bg-gradient-to-r ${currentExamData.gradient} hover:opacity-90 text-white border-0 px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  <Play className="h-6 w-6 mr-3" />
                  Start Mock Exam
                  {/* <Zap className="h-6 w-6 ml-3" /> */}
                </Button>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Exam Counter */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
              <span className="text-sm font-medium text-gray-600">
                {currentExam + 1} of {allExams.length}
              </span>
              <div className="flex gap-1">
                {allExams.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentExam(index)}
                    className={`cursor-pointer w-2 h-2 rounded-full transition-colors ${
                      index === currentExam ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <span className="block text-2xl my-6 text-center font-bold">
            Mock Exam History
          </span>

          <DataTable
            isLoading={isLoadingMockExamsHistory}
            columns={mockExamHistoryColumns}
            data={mockExamsHistoryData?.getUserMockExamHistory?.data ?? []}
            drawerType="mock-exam"
            refetchFunction={refetchMockExamsHistory}
          ></DataTable>
        </div>
      </div>
    </div>
  );
}
