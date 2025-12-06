import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAutoScroll } from "./useAutoScroll";

interface EvaluateQuestionEventProps {
  data: string;
  isActive?: boolean;
}

interface DistractorPlausibility {
  choice: string;
  score: number;
  explanation: string;
}

interface EvaluationResult {
  result: "pass" | "fail";
  explanation: string;
}

interface EvaluationData {
  distractor_plausibility: DistractorPlausibility[];
  explanation_tone: EvaluationResult;
  question_repetition: EvaluationResult;
  improvement_suggestions: string;
}

export const EvaluateQuestionEvent: React.FC<EvaluateQuestionEventProps> = ({
  data,
  isActive,
}) => {
  const [showThoughtProcess, setShowThoughtProcess] = useState(false);
  
  // Auto-scroll hook
  const { contentRef, autoScrollEnabled } = useAutoScroll(data, isActive);

  // Extract the thought process and evaluation data
  let thoughtProcess = "";
  let evaluationData: EvaluationData | null = null;
  let hasCompleteJson = false;

  // Split by "I'll provide the final evaluation" or similar markers
  const splitPoints = [
    "I'll provide the final evaluation",
    "provide the final evaluation",
    "final evaluation in the specified JSON format:",
    "```json",
  ];

  let splitIndex = -1;
  for (const point of splitPoints) {
    const idx = data.indexOf(point);
    if (idx !== -1) {
      splitIndex = idx;
      break;
    }
  }

  if (splitIndex !== -1) {
    thoughtProcess = data.substring(0, splitIndex).trim();

    // Extract JSON from the rest
    const afterSplit = data.substring(splitIndex);
    const jsonMatch = afterSplit.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      let jsonString = jsonMatch[0];

      // Find the complete JSON object
      let braceCount = 0;
      let jsonEnd = 0;

      for (let i = 0; i < jsonString.length; i++) {
        if (jsonString[i] === "{") braceCount++;
        if (jsonString[i] === "}") {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
          }
        }
      }

      if (jsonEnd > 0) {
        jsonString = jsonString.substring(0, jsonEnd);
        try {
          evaluationData = JSON.parse(jsonString);
          hasCompleteJson = true;
        } catch (e) {
          // JSON is incomplete
          hasCompleteJson = false;
        }
      }
    } else {
      // No JSON found yet, all data is thought process
      thoughtProcess = data;
    }
  } else {
    // No split point found - extract thought process and look for JSON
    const jsonMatch = data.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      // Find where JSON starts
      const jsonStartIndex = data.indexOf(jsonMatch[0]);
      
      // Everything before JSON is thought process
      if (jsonStartIndex > 0) {
        thoughtProcess = data.substring(0, jsonStartIndex).trim();
      }
      
      let jsonString = jsonMatch[0];
      let braceCount = 0;
      let jsonEnd = 0;

      for (let i = 0; i < jsonString.length; i++) {
        if (jsonString[i] === "{") braceCount++;
        if (jsonString[i] === "}") {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
          }
        }
      }

      if (jsonEnd > 0) {
        jsonString = jsonString.substring(0, jsonEnd);
        try {
          evaluationData = JSON.parse(jsonString);
          hasCompleteJson = true;
        } catch (e) {
          hasCompleteJson = false;
        }
      }
    } else {
      // No JSON at all yet, everything is thought process
      thoughtProcess = data;
    }
  }

  // Parse markdown text (reuse from GenerateQuestionEvent)
  const parseMarkdownText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    const combinedRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }

      const matchedText = match[0];

      if (matchedText.startsWith("**") && matchedText.endsWith("**")) {
        const content = matchedText.slice(2, -2);
        parts.push(
          <strong key={`bold-${key++}`} className="font-semibold text-foreground">
            {content}
          </strong>
        );
      } else if (matchedText.startsWith("`") && matchedText.endsWith("`")) {
        const content = matchedText.slice(1, -1);
        parts.push(
          <code
            key={`code-${key++}`}
            className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs font-mono"
          >
            {content}
          </code>
        );
      }

      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  // Get result icon and color
  const getResultDisplay = (result: "pass" | "fail") => {
    if (result === "pass") {
      return {
        icon: <CheckCircle2 size={16} className="text-green-600" />,
        color: "text-green-600 bg-green-50 border-green-200",
        text: "Pass",
      };
    }
    return {
      icon: <XCircle size={16} className="text-red-600" />,
      color: "text-red-600 bg-red-50 border-red-200",
      text: "Fail",
    };
  };

  // If we don't have complete JSON yet, show the thought process in real-time
  if (!hasCompleteJson) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="mb-3 sm:mb-6">
          <p className="text-xs text-muted-foreground">
            {isActive ? "Evaluating question quality..." : "Analyzing question"}
          </p>
        </div>

        <div className="border-[.5px] my-3 sm:my-6 border-gray-200" />

        {/* Show thought process while generating */}
        {thoughtProcess && (
          <div 
            ref={contentRef}
            className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 overflow-y-auto max-h-[500px]"
          >
            <h3 className="text-sm sm:text-base text-foreground mb-2 sm:mb-3 break-words">
              Evaluation Process
            </h3>
            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2 sm:space-y-3">
              {parseMarkdownText(thoughtProcess)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Once we have complete JSON, show the full structured view
  if (!evaluationData) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to parse evaluation data
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-full overflow-x-hidden">
      <div className="mb-3 sm:mb-6">
        <p className="text-xs text-muted-foreground">
          Comprehensive evaluation of the generated question quality
        </p>
      </div>

      <div className="border-[.5px] my-3 sm:my-6 border-gray-200" />

      {/* Evaluation Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Explanation Tone */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-2 text-[10px] sm:text-xs">
            Explanation Tone
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {getResultDisplay(evaluationData.explanation_tone.result).icon}
            <span
              className={`font-medium px-2 py-1 rounded border text-xs ${
                getResultDisplay(evaluationData.explanation_tone.result).color
              }`}
            >
              {getResultDisplay(evaluationData.explanation_tone.result).text}
            </span>
          </div>
        </div>

        {/* Question Repetition */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-2 text-[10px] sm:text-xs">
            Question Repetition
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {getResultDisplay(evaluationData.question_repetition.result).icon}
            <span
              className={`font-medium px-2 py-1 rounded border text-xs ${
                getResultDisplay(evaluationData.question_repetition.result).color
              }`}
            >
              {getResultDisplay(evaluationData.question_repetition.result).text}
            </span>
          </div>
        </div>
      </div>

      {/* Distractor Plausibility Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 max-w-full overflow-x-hidden">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">
          Distractor Plausibility Scores
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {evaluationData.distractor_plausibility.map((distractor, index) => (
            <div
              key={index}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-full"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center font-bold text-xs sm:text-sm ${getScoreColor(
                  distractor.score
                )}`}
              >
                {distractor.score}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-semibold text-foreground mb-1 break-words">
                  {distractor.choice}
                </p>
                <p className="text-xs text-muted-foreground break-words">
                  {distractor.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Suggestions */}
      {evaluationData.improvement_suggestions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 max-w-full overflow-x-hidden">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-blue-900 mb-1">
                Improvement Suggestions
              </h3>
              <p className="text-xs text-blue-800 break-words">
                {evaluationData.improvement_suggestions}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thought Process Section - Collapsible */}
      {thoughtProcess && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowThoughtProcess(!showThoughtProcess)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-sm font-medium text-foreground">
              Evaluation Process
            </h3>
            {showThoughtProcess ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </button>

          {showThoughtProcess && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="text-xs text-muted-foreground leading-relaxed space-y-3 pt-4 whitespace-pre-line">
                {parseMarkdownText(thoughtProcess)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Step Indicator */}
      <div className="flex items-start sm:items-center gap-2 text-sm text-muted-foreground pt-2">
        <ArrowRight size={14} className="text-primary flex-shrink-0 mt-0.5 sm:mt-0 sm:w-4 sm:h-4" />
        <span className="text-xs break-words">Question evaluation complete.</span>
      </div>
    </div>
  );
};

