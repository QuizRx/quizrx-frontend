import React, { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  CheckSquare,
  XCircle,
  Clock,
  BarChart,
  FileText,
  Percent,
  Database,
  Timer,
  ArrowLeft,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

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

interface MockExamResultsProps {
  quizResult: QuizResult;
  onBackToMockExams: () => void;
  onRetakeExam: () => void;
}

const MockExamResults = ({
  quizResult,
  onBackToMockExams,
  onRetakeExam,
}: MockExamResultsProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

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

  // Animate score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      let currentScore = 0;
      const targetScore = quizResult.score;
      const duration = 800; // Total animation duration in ms
      const steps = 20; // Number of steps
      const increment = targetScore / steps;
      const stepDuration = duration / steps;

      const interval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
          currentScore = targetScore;
          clearInterval(interval);
        }
        setAnimatedScore(Math.round(currentScore));
      }, stepDuration);
    }, 100); // Very short initial delay

    return () => clearTimeout(timer);
  }, [quizResult.score]);

  // Get performance level and color
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", color: "from-blue-400 to-blue-600", icon: Trophy, bg: "bg-blue-50" };
    if (score >= 80) return { level: "Great", color: "from-blue-400 to-blue-600", icon: Star, bg: "bg-blue-50" };
    if (score >= 70) return { level: "Good", color: "from-blue-400 to-blue-600", icon: TrendingUp, bg: "bg-blue-50" };
    if (score >= 60) return { level: "Fair", color: "from-blue-400 to-blue-600", icon: Target, bg: "bg-blue-50" };
    return { level: "Needs Work", color: "from-blue-400 to-blue-600", icon: Zap, bg: "bg-blue-50" };
  };

  const performance = getPerformanceLevel(quizResult.score);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-25 p-6">

      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
            <PerformanceIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            {performance.level}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            You've completed your mock exam. Here's your detailed performance breakdown.
          </p>
        </div>

        {/* Main Score Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-12 border border-slate-100">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Score Circle */}
            <div className="relative mb-8 lg:mb-0">
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-center shadow-inner">
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-1">
                      {animatedScore}%
                    </div>
                    <div className="text-sm text-blue-50">Score</div>
                  </div>
                </div>
              </div>
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(quizResult.score / 100) * 283} 283`}
                  className="text-blue-200 transition-all duration-1000 ease-out"
                />
              </svg>
            </div>

            {/* Score Details */}
            <div className="flex-1 lg:ml-12 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {quizResult.correctAnswers}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Correct</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {quizResult.wrongAnswers}
                  </div>
                  <div className="text-sm text-red-700 font-medium">Incorrect</div>
                </div>
              </div>

              <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
                <div className="text-2xl font-bold text-slate-600 mb-1">
                  {quizResult.totalQuestions}
                </div>
                <div className="text-sm text-slate-700 font-medium">Total Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Time Taken */}
          <div className="group bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">{formatTime(quizResult.timeSpent)}</div>
                <div className="text-sm text-slate-600">Time Taken</div>
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((quizResult.timeSpent / (quizResult.totalQuestions * 90)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Average Time */}
          <div className="group bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">{formatAvgTime(quizResult.averageTimePerQuestion)}</div>
                <div className="text-sm text-slate-600">Avg Time/Question</div>
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((quizResult.averageTimePerQuestion / 90) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="group bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">{quizResult.difficulty}</div>
                <div className="text-sm text-slate-600">Difficulty</div>
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-3/4" />
            </div>
          </div>

          {/* Type */}
          <div className="group bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">{quizResult.type}</div>
                <div className="text-sm text-slate-600">Exam Type</div>
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-full" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={onBackToMockExams}
            className="flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Mock Exams
          </Button>
          <Button
            onClick={onRetakeExam}
            className="flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <Zap className="h-5 w-5" />
            Retake Exam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MockExamResults;