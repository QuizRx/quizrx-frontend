import React from "react";
import { ArrowRight } from "lucide-react";
import { useAutoScroll } from "./useAutoScroll";

interface GetRelevantConceptEventProps {
  data: string;
  isActive?: boolean;
}

// Helper function to parse markdown-style bold text
const parseMarkdown = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }
    // Add the bold text
    parts.push(
      <strong key={match.index} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    currentIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? parts : [text];
};

// Helper function to detect if a paragraph is a numbered list item
const isNumberedListItem = (text: string): boolean => {
  return /^\d+\.\s/.test(text.trim());
};

// Helper function to detect if a paragraph is a sub-item (starts with -)
const isSubItem = (text: string): boolean => {
  return /^\s*-\s/.test(text);
};

export const GetRelevantConceptEvent: React.FC<
  GetRelevantConceptEventProps
> = ({ data, isActive }) => {
  // Auto-scroll hook
  const { contentRef, autoScrollEnabled } = useAutoScroll(data, isActive);

  // Clean the data by removing JSON blocks at the end
  let cleanedText = data;

  // Remove markdown JSON blocks (```json ... ```)
  cleanedText = cleanedText.replace(/```json\s*\n?[\s\S]*?\n?```/g, "").trim();

  // Remove any remaining JSON objects at the end
  cleanedText = cleanedText.replace(/\{[\s\S]*?\}\s*$/g, "").trim();

  // Split text into paragraphs by double newlines or \n\n
  const paragraphs = cleanedText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="space-y-3 sm:space-y-4 max-w-full overflow-x-hidden">
      <div className="mb-3 sm:mb-6">
        <p className="text-xs text-muted-foreground">
          Locating key medical concepts connected to your topic
        </p>
      </div>

      <div className="border-[.5px] my-3 sm:my-6 border-gray-200" />

      {/* Thought Process Section */}
      <div 
        ref={contentRef}
        className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 max-w-full overflow-x-hidden overflow-y-auto max-h-[500px]"
      >
        <h3 className="text-sm sm:text-base text-foreground mb-2 sm:mb-3 break-words">
          Thought Process
        </h3>

        <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2 sm:space-y-3 max-w-full">
          {paragraphs.map((paragraph, index) => {
            // Check if it's a numbered list item
            if (isNumberedListItem(paragraph)) {
              // Extract the number and the rest of the text
              const match = paragraph.match(/^(\d+)\.\s([\s\S]*)$/);
              if (match) {
                const [, number, content] = match;
                // Split content by newlines to handle sub-items
                const lines = content.split("\n").filter((line) => line.trim());

                return (
                  <div key={index} className="flex gap-2 sm:gap-3 items-start max-w-full">
                    <span className="font-semibold text-primary flex-shrink-0 mt-0.5 text-xs sm:text-sm">
                      {number}.
                    </span>
                    <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0 overflow-hidden">
                      {lines.map((line, lineIndex) => {
                        const trimmedLine = line.trim();
                        if (isSubItem(trimmedLine)) {
                          // Sub-item
                          const subContent = trimmedLine.replace(/^\s*-\s/, "");
                          return (
                            <div
                              key={lineIndex}
                              className="ml-3 sm:ml-4 text-muted-foreground break-words"
                            >
                              <span className="text-primary mr-2">•</span>
                              {parseMarkdown(subContent)}
                            </div>
                          );
                        } else {
                          // Main content of the numbered item
                          return (
                            <p key={lineIndex} className="text-foreground break-words">
                              {parseMarkdown(trimmedLine)}
                            </p>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              }
            }

            // Regular paragraph
            return (
              <p
                key={index}
                className="text-justify text-foreground leading-relaxed break-words"
              >
                {parseMarkdown(paragraph)}
              </p>
            );
          })}
        </div>
      </div>

      {/* Next Step Indicator */}
      <div className="flex items-start sm:items-center gap-2 text-sm text-muted-foreground pt-2">
        <ArrowRight size={14} className="text-primary flex-shrink-0 mt-0.5 sm:mt-0 sm:w-4 sm:h-4" />
        <span className="text-xs break-words">Next: Generating Question.</span>
      </div>
    </div>
  );
};
