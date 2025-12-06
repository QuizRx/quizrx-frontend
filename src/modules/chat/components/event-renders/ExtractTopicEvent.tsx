import React from "react";
import { ArrowRight } from "lucide-react";
import { extractJsonFromData, formatValue } from "./utils";

interface ExtractTopicEventProps {
  data: string;
  isActive?: boolean;
}

interface ExtractedData {
  topic: string | null;
  subtopic: string | null;
  keyword: string;
  difficulty: string | null;
  question_type: string | null;
  confidence: number;
}

export const ExtractTopicEvent: React.FC<ExtractTopicEventProps> = ({
  data,
  isActive,
}) => {
  console.log("data: ", data);

  // Parse the data
  let extractedData: ExtractedData = {
    topic: null,
    subtopic: null,
    keyword: "",
    difficulty: null,
    question_type: null,
    confidence: 0,
  };

  const parsed = extractJsonFromData(data);
  if (parsed) {
    extractedData = {
      topic: parsed.topic,
      subtopic: parsed.subtopic,
      keyword: parsed.keyword || "",
      difficulty: parsed.difficulty,
      question_type: parsed.question_type,
      confidence: parsed.confidence || 0,
    };
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-3 sm:mb-6">
        <p className="text-xs text-muted-foreground">
          We've identified the main subject for your quiz question
        </p>
      </div>

      {/* Grid of info cards - 1 col on mobile, 2 cols on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Topic Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
            Topic
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(extractedData.topic)}
          </p>
        </div>

        {/* Subtopic Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
            Subtopic
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(extractedData.subtopic)}
          </p>
        </div>

        {/* Difficulty Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
            Difficulty
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(extractedData.difficulty)}
          </p>
        </div>

        {/* Question Type Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-xs">
          <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
            Question Type
          </h3>
          <p className="font-medium text-foreground text-xs sm:text-sm break-words">
            {formatValue(extractedData.question_type)}
          </p>
        </div>
      </div>

      {/* Next Step Indicator */}
      <div className="flex items-start sm:items-center gap-2 text-sm text-muted-foreground pt-2">
        <ArrowRight size={14} className="text-primary flex-shrink-0 mt-0.5 sm:mt-0 sm:w-4 sm:h-4" />
        <span className="text-xs break-words">
          Next: Enhancing the query to refine the subtopic.
        </span>
      </div>
    </div>
  );
};
