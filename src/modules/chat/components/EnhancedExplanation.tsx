import React from "react";
import { EnhancedExplanation as EnhancedExplanationType } from "../types/api/question";
import { CheckCircle2, XCircle, Lightbulb, Clock } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";

interface EnhancedExplanationProps {
  explanation: string | EnhancedExplanationType;
  generationTime?: number;
  className?: string;
}

function isEnhancedExplanation(
  explanation: string | EnhancedExplanationType
): explanation is EnhancedExplanationType {
  return (
    typeof explanation === "object" &&
    explanation !== null &&
    "correct_answer" in explanation &&
    "distractors" in explanation &&
    "key_points" in explanation
  );
}

/**
 * EnhancedExplanation Component
 *
 * Displays question explanations with support for both legacy (string) and
 * enhanced (structured) formats. The enhanced format includes:
 * - Correct answer with detailed explanation
 * - Distractor explanations (why wrong answers are incorrect)
 * - Key learning points
 *
 * Automatically detects format and renders appropriately with backward compatibility.
 */
export const EnhancedExplanation: React.FC<EnhancedExplanationProps> = ({
  explanation,
  generationTime,
  className = "",
}) => {
  // Legacy format: simple string explanation
  if (typeof explanation === "string") {
    return (
      <div className={`space-y-2 sm:space-y-3 ${className}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4 max-w-full overflow-x-hidden">
          <h4 className="text-xs sm:text-sm font-semibold mb-2 text-blue-900 flex items-center gap-2">
            <Lightbulb className="hidden sm:block w-4 h-4 flex-shrink-0" />
            <span>Explanation</span>
          </h4>
          <p className="text-xs sm:text-sm text-blue-800 leading-relaxed break-words sm:pl-0">
            {explanation}
          </p>
        </div>

        {generationTime && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>Generated in {generationTime.toFixed(1)}s</span>
          </div>
        )}
      </div>
    );
  }

  // Enhanced format: structured explanation
  if (!isEnhancedExplanation(explanation)) {
    console.error("Invalid explanation format:", explanation);
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">
          Unable to display explanation: Invalid format
        </p>
      </div>
    );
  }

  const enhanced = explanation;

  return (
    <div
      className={`space-y-3 sm:space-y-4 ${className} max-w-full overflow-x-hidden`}
    >
      {/* Correct Answer Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4 shadow-sm max-w-full overflow-x-hidden">
        <div className="flex items-start gap-0 sm:gap-3">
          <CheckCircle2 className="hidden sm:block w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0 w-full">
            <h5 className="text-xs sm:text-sm font-semibold text-green-900 mb-2 flex items-center flex-wrap gap-2">
              <span>Correct Answer</span>
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300 text-xs"
              >
                ✓
              </Badge>
            </h5>
            <p className="text-xs sm:text-sm font-medium text-green-800 mb-2 bg-white/60 rounded px-2 sm:px-3 py-1.5 sm:py-2 border border-green-200 break-words">
              {enhanced.correct_answer.content}
            </p>
            <p className="text-xs sm:text-sm text-green-700 leading-relaxed break-words">
              {enhanced.correct_answer.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Distractors Section */}
      {enhanced.distractors && enhanced.distractors.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg p-3 sm:p-4 shadow-sm max-w-full overflow-x-hidden">
          <div className="flex items-start gap-0 sm:gap-3 mb-3">
            <XCircle className="hidden sm:block w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <h5 className="text-xs sm:text-sm font-semibold text-red-900">
              Why Other Options Are Incorrect
            </h5>
          </div>
          <div className="space-y-2 sm:space-y-3 ml-0 sm:ml-8">
            {enhanced.distractors.map((distractor, idx) => (
              <div
                key={idx}
                className="border-l-3 border-red-300 pl-3 sm:pl-4 py-2 bg-white/60 rounded-r max-w-full overflow-x-hidden"
              >
                <p className="text-xs sm:text-sm font-medium text-red-800 mb-1.5 break-words">
                  {distractor.content}
                </p>
                <p className="text-xs sm:text-sm text-red-700 leading-relaxed break-words">
                  {distractor.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Learning Points Section */}
      {enhanced.key_points && enhanced.key_points.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4 shadow-sm max-w-full overflow-x-hidden">
          <div className="flex items-start gap-0 sm:gap-3 mb-3">
            <Lightbulb className="hidden sm:block w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <h5 className="text-xs sm:text-sm font-semibold text-blue-900">
              Key Learning Points
            </h5>
          </div>
          <ul className="space-y-2 ml-0 sm:ml-8">
            {enhanced.key_points.map((point, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-blue-800 leading-relaxed flex items-start gap-2"
              >
                <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">
                  •
                </span>
                <span className="flex-1 break-words">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generation Time Footer */}
      {generationTime && (
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>Question generated in {generationTime.toFixed(1)}s</span>
        </div>
      )}
    </div>
  );
};
