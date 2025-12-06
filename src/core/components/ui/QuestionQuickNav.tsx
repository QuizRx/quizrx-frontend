import React from "react";

interface QuestionQuickNavProps {
  totalQuestions: number;
  currentIndex: number;
  onNavigate: (index: number) => void;
  maxVisible?: number;
  userAnswers?: { [questionIndex: number]: string };
}

const QuestionQuickNav: React.FC<QuestionQuickNavProps> = ({
  totalQuestions,
  currentIndex,
  onNavigate,
  maxVisible = 25,
  userAnswers = {},
}) => {
  const [currentRange, setCurrentRange] = React.useState(0);
  const totalRanges = Math.ceil(totalQuestions / maxVisible);
  const startIndex = currentRange * maxVisible;
  const endIndex = Math.min(startIndex + maxVisible, totalQuestions);
  const visibleCount = endIndex - startIndex;
  const numbers = Array.from({ length: visibleCount }, (_, i) => startIndex + i + 1);

  const handlePrevRange = () => {
    if (currentRange > 0) {
      setCurrentRange(currentRange - 1);
    }
  };

  const handleNextRange = () => {
    if (currentRange < totalRanges - 1) {
      setCurrentRange(currentRange + 1);
    }
  };

  const canGoPrev = currentRange > 0;
  const canGoNext = currentRange < totalRanges - 1;

  return (
    <div className="w-full p-4 bg-white rounded-lg border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Quick Navigation</div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevRange}
            disabled={!canGoPrev}
            className={`p-2 rounded-md border transition-colors ${
              canGoPrev
                ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-sm text-gray-600">
            {startIndex + 1}-{endIndex} of {totalQuestions}
          </span>
          <button
            onClick={handleNextRange}
            disabled={!canGoNext}
            className={`p-2 rounded-md border transition-colors ${
              canGoNext
                ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {numbers.map((num, idx) => {
          const questionIndex = startIndex + idx;
          const isAnswered = userAnswers[questionIndex] !== undefined;
          const isCurrent = currentIndex === questionIndex;

          return (
            <button
              key={num}
              onClick={() => onNavigate(questionIndex)}
              className={`cursor-pointer w-10 h-10 rounded-md border flex items-center justify-center text-base font-medium transition-colors relative
                ${
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-600"
                    : isAnswered
                    ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                    : "bg-white text-red-900 border-red-300 hover:bg-red-100"
                }
              `}
            >
              {num}
              {isAnswered && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
              {!isAnswered && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionQuickNav;
