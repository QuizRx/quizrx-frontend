import React from "react";
import { CheckCircle2, Award } from "lucide-react";

interface FinalizeEventProps {
  data: string;
  isActive?: boolean;
  isReviewMode?: boolean; // Only show answers and explanations if true
}

interface ParsedFinalize {
  question: string;
  choices: { letter: string; text: string }[];
  correctAnswer: string;
  explanations: { choice: string; reason: string; isCorrect: boolean }[];
  keyPoints: string[];
}

export const FinalizeEvent: React.FC<FinalizeEventProps> = ({
  data,
  isActive,
  isReviewMode = false,
}) => {
  // Don't show answers and explanations if not in review mode (user hasn't answered yet)
  if (!isReviewMode) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-900">
          ✨ Question generated successfully! Answer the question to see the
          detailed explanation.
        </p>
      </div>
    );
  }

  const parseFinalize = (text: string): ParsedFinalize | null => {
    try {
      const result: ParsedFinalize = {
        question: "",
        choices: [],
        correctAnswer: "",
        explanations: [],
        keyPoints: [],
      };

      // Extract Question
      const questionMatch = text.match(
        /Question:\s*([\s\S]+?)(?=\n\n|Choices:)/
      );
      if (questionMatch) {
        result.question = questionMatch[1].trim();
      }

      // Extract Choices - improved regex to capture all choices
      const choicesMatch = text.match(/Choices:\s*\n((?:[A-E]\..+\n?)+)/);
      if (choicesMatch) {
        const choicesText = choicesMatch[1];
        const choiceLines = choicesText
          .split(/\n/)
          .filter((line) => line.trim());

        result.choices = choiceLines
          .map((line) => {
            const match = line.trim().match(/^([A-E])\.\s*([\s\S]+)$/);
            if (match) {
              return { letter: match[1], text: match[2].trim() };
            }
            return { letter: "", text: "" };
          })
          .filter((c) => c.letter && c.text);
      }

      // Extract Correct Answer
      const correctAnswerMatch = text.match(
        /Correct Answer:\s*([\s\S]+?)(?=\n\n|Explanation:)/
      );
      if (correctAnswerMatch) {
        result.correctAnswer = correctAnswerMatch[1].trim();
      }

      // Extract Explanations
      const explanationMatch = text.match(
        /Explanation:\s*([\s\S]+?)(?=Key Points:|$)/
      );
      if (explanationMatch) {
        const explanationText = explanationMatch[1];
        const explanationLines = explanationText
          .split(/\n-\s*/)
          .filter((line) => line.trim());

        result.explanations = explanationLines
          .map((line) => {
            const match = line.match(
              /Choice `(.+?)` is (correct|incorrect) because:\s*([\s\S]+)/
            );
            if (match) {
              return {
                choice: match[1].trim(),
                reason: match[3].trim(),
                isCorrect: match[2] === "correct",
              };
            }
            return null;
          })
          .filter(Boolean) as {
          choice: string;
          reason: string;
          isCorrect: boolean;
        }[];
      }

      // Extract Key Points
      const keyPointsMatch = text.match(/Key Points:\s*([\s\S]+?)$/);
      if (keyPointsMatch) {
        const keyPointsText = keyPointsMatch[1];
        const keyPointLines = keyPointsText
          .split(/\n-\s*/)
          .filter((line) => line.trim());

        result.keyPoints = keyPointLines
          .map((line) => line.trim())
          .filter(Boolean);
      }

      return result;
    } catch (e) {
      console.error("Failed to parse finalize data:", e);
      return null;
    }
  };

  const parsed = parseFinalize(data);

  if (!parsed) {
    return (
      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
        {data}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Award size={18} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Question Summary
        </h3>
      </div>

      {/* Question */}
      {parsed.question && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Question
          </h4>
          <p className="text-sm text-foreground leading-relaxed">
            {parsed.question}
          </p>
        </div>
      )}

      {/* Choices - only show if we have valid choices with text */}
      {parsed.choices.length > 0 &&
        parsed.choices.some((c) => c.text && c.text.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Answer Choices
            </h4>
            <div className="space-y-1.5">
              {parsed.choices
                .filter((choice) => choice.text && choice.text.length > 0)
                .map((choice, index) => {
                  const isCorrect =
                    choice.text === parsed.correctAnswer ||
                    choice.text.includes(parsed.correctAnswer) ||
                    parsed.correctAnswer.includes(choice.text);

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                        isCorrect
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <span
                        className={`font-semibold min-w-[20px] ${
                          isCorrect ? "text-green-700" : "text-gray-600"
                        }`}
                      >
                        {choice.letter}.
                      </span>
                      <span
                        className={
                          isCorrect
                            ? "text-green-900 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {choice.text}
                      </span>
                      {isCorrect && (
                        <CheckCircle2
                          size={16}
                          className="text-green-600 ml-auto flex-shrink-0 mt-0.5"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      {/* Explanations */}
      {parsed.explanations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Detailed Explanation
          </h4>
          <div className="space-y-2">
            {parsed.explanations.map((exp, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border ${
                  exp.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold uppercase ${
                      exp.isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {exp.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs font-medium text-gray-700 flex-1">
                    {exp.choice}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mt-1 pl-0">
                  {exp.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Points */}
      {parsed.keyPoints.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Key Takeaways
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <ul className="space-y-1.5">
              {parsed.keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-900 flex items-start gap-2"
                >
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span className="flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
