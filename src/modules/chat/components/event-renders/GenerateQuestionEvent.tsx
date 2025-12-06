import React, { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { extractJsonFromData, formatValue } from "./utils";
import { useAutoScroll } from "./useAutoScroll";

interface GenerateQuestionEventProps {
  data: string;
  isActive?: boolean;
}

interface QuestionData {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  question_type: string;
}

export const GenerateQuestionEvent: React.FC<GenerateQuestionEventProps> = ({
  data,
  isActive,
}) => {
  const [showThoughtProcess, setShowThoughtProcess] = useState(false);
  
  // Auto-scroll hook
  const { contentRef, autoScrollEnabled } = useAutoScroll(data, isActive);

  // Extract the thought process (everything before the JSON)
  let thoughtProcess = "";
  let questionData: QuestionData | null = null;
  let hasCompleteJson = false;

  // Try multiple split points to separate thought process from JSON
  const splitPoints = [
    "Here is the generated question:",
    "Here's the question in the specified JSON format:",
    "Here's the question:",
    "```json",
  ];

  let splitIndex = -1;
  let usedSplitPoint = "";
  
  for (const point of splitPoints) {
    const idx = data.indexOf(point);
    if (idx !== -1) {
      splitIndex = idx;
      usedSplitPoint = point;
      break;
    }
  }

  if (splitIndex !== -1) {
    // Everything before the split point is the thought process
    thoughtProcess = data.substring(0, splitIndex).trim();

    // Everything after is the JSON (may have extra text before/after)
    const afterSplit = data.substring(splitIndex + usedSplitPoint.length);

    // Extract the JSON object from after the split
    // Look for the JSON that starts with { and ends with }
    const jsonMatch = afterSplit.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      let jsonString = jsonMatch[0];

      // Try to find the end of the JSON more precisely
      // We need to find the matching closing brace
      try {
        // Try to parse and if it fails, we'll try to clean it
        questionData = JSON.parse(jsonString);
        hasCompleteJson = true;
      } catch (e) {
        // If it fails, try to extract just until the first complete JSON object
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
            questionData = JSON.parse(jsonString);
            hasCompleteJson = true;
          } catch (e2) {
            // JSON is incomplete, will show thought process only
            hasCompleteJson = false;
          }
        }
      }
    }
  } else {
    // No split point found - try to extract JSON directly from the entire data
    const jsonMatch = data.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      // Find the start of the JSON
      const jsonStartIndex = data.indexOf(jsonMatch[0]);
      
      // Everything before JSON is thought process
      if (jsonStartIndex > 0) {
        thoughtProcess = data.substring(0, jsonStartIndex).trim();
      }
      
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
          questionData = JSON.parse(jsonString);
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
  }

  // Parse markdown-like text to JSX
  const parseMarkdownText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Combined regex to match bold (**text**), code (`text`), or regular text
    const combinedRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(remaining)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }

      const matchedText = match[0];

      // Check if it's bold text
      if (matchedText.startsWith("**") && matchedText.endsWith("**")) {
        const content = matchedText.slice(2, -2);
        parts.push(
          <strong
            key={`bold-${key++}`}
            className="font-semibold text-foreground"
          >
            {content}
          </strong>
        );
      }
      // Check if it's code
      else if (matchedText.startsWith("`") && matchedText.endsWith("`")) {
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

    // Add remaining text
    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Clean and format thought process
  const formatThoughtProcess = (text: string) => {
    // Remove "Final answer in JSON format:" and similar phrases
    let cleanedText = text
      .replace(/Final answer in JSON format:?/gi, "")
      .replace(/Final answer:?/gi, "")
      .trim();

    // Split by ### headers and paragraphs
    const sections = cleanedText.split(/###\s+/);
    return sections
      .filter((s) => s.trim().length > 0)
      .filter((s) => {
        // Filter out "Final Answer" section since we already show it in the UI
        const lowerSection = s.toLowerCase();
        return !lowerSection.startsWith("final answer");
      });
  };

  const thoughtSections = thoughtProcess
    ? formatThoughtProcess(thoughtProcess)
    : [];

  // If we don't have complete JSON yet, show the thought process in real-time
  if (!hasCompleteJson) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="mb-3 sm:mb-6">
          <p className="text-xs text-muted-foreground">
            {isActive ? "Generating question..." : "Building your question"}
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
              Thought Process
            </h3>
            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2 sm:space-y-3">
              {thoughtSections.map((section, idx) => (
                <div key={idx} className="break-words">
                  {parseMarkdownText(section)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Once we have complete JSON, show the full structured view
  if (!questionData) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to parse question data
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-3 sm:mb-6">
        <p className="text-xs text-muted-foreground">
          Generated a high-quality, evidence-based question
        </p>
      </div>

      <div className="border-[.5px] my-3 sm:my-6 border-gray-200" />

      {/* Metadata Cards - 1 col on mobile, 2 cols on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1 text-[10px] sm:text-xs">
            Topic
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(questionData.topic)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1 text-[10px] sm:text-xs">
            Subtopic
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(questionData.subtopic)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1 text-[10px] sm:text-xs">
            Difficulty
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(questionData.difficulty)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1 text-[10px] sm:text-xs">
            Question Type
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(questionData.question_type)}
          </p>
        </div>
      </div>

      {/* Generated Question Card - Highlighted */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-semibold text-primary mb-2 sm:mb-3">
          Generated Question
        </h3>
        <p className="text-xs sm:text-sm text-foreground leading-relaxed mb-3 sm:mb-4 break-words">
          {questionData.question}
        </p>

        {/* Answer Choices */}
        <div className="space-y-2">
          {questionData.choices.map((choice, index) => {
            return (
              <div
                key={index}
                className="flex items-start gap-2 p-2 sm:p-3 rounded-md text-xs bg-white border border-gray-200"
              >
                <span className="font-medium text-muted-foreground flex-shrink-0 text-[10px] sm:text-xs">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-foreground text-xs break-words">
                  {choice}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thought Process Section - Collapsible */}
      {thoughtSections.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowThoughtProcess(!showThoughtProcess)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-sm font-medium text-foreground">
              Thought Process
            </h3>
            {showThoughtProcess ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </button>

          {showThoughtProcess && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="text-xs text-muted-foreground leading-relaxed space-y-4 pt-4">
                {thoughtSections.map((section, index) => {
                  const lines = section
                    .split("\n")
                    .filter((l) => l.trim().length > 0);
                  const title = lines[0];
                  const contentLines = lines.slice(1);

                  return (
                    <div key={index} className="space-y-2">
                      {title && (
                        <h4 className="font-semibold text-foreground text-sm mb-3">
                          {parseMarkdownText(title.trim())}
                        </h4>
                      )}
                      {contentLines.length > 0 && (
                        <div className="space-y-2 pl-2">
                          {(() => {
                            // Filter out JSON code blocks completely
                            let inJsonBlock = false;
                            const filteredLines: string[] = [];

                            for (const line of contentLines) {
                              const trimmed = line.trim();

                              // Detect start of JSON block
                              if (
                                trimmed.startsWith("```json") ||
                                trimmed.startsWith("```")
                              ) {
                                inJsonBlock = true;
                                continue;
                              }

                              // Detect end of JSON block
                              if (inJsonBlock && trimmed === "```") {
                                inJsonBlock = false;
                                continue;
                              }

                              // Skip lines inside JSON block
                              if (inJsonBlock) {
                                continue;
                              }

                              // Add non-JSON lines
                              if (trimmed.length > 0) {
                                filteredLines.push(line);
                              }
                            }

                            return filteredLines.map((line, lineIndex) => {
                              const trimmedLine = line.trim();

                              // Check if line starts with a bullet point
                              if (trimmedLine.startsWith("- ")) {
                                const bulletContent = trimmedLine.substring(2);
                                return (
                                  <div key={lineIndex} className="flex gap-2">
                                    <span className="text-primary mt-0.5">
                                      •
                                    </span>
                                    <span className="flex-1">
                                      {parseMarkdownText(bulletContent)}
                                    </span>
                                  </div>
                                );
                              }

                              // Regular paragraph
                              return (
                                <p key={lineIndex} className="text-justify">
                                  {parseMarkdownText(trimmedLine)}
                                </p>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Step Indicator */}
      <div className="flex items-start sm:items-center gap-2 text-sm text-muted-foreground pt-2">
        <ArrowRight
          size={14}
          className="text-primary flex-shrink-0 mt-0.5 sm:mt-0 sm:w-4 sm:h-4"
        />
        <span className="text-xs break-words">
          Next: Evaluating question quality.
        </span>
      </div>
    </div>
  );
};
