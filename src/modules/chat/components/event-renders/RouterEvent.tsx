import React from "react";
import { ArrowRight } from "lucide-react";
import { extractJsonFromData, formatValue } from "./utils";

interface RouterEventProps {
  data: string;
  isActive?: boolean;
}

export const RouterEvent: React.FC<RouterEventProps> = ({ data, isActive }) => {
  console.log("data: ", data);

  // Parse the data to extract next_action
  let nextAction = "Unknown action";

  const parsed = extractJsonFromData(data);
  if (parsed && parsed.next_action) {
    nextAction = parsed.next_action;
  } else {
    // Fallback: try to extract from string
    const match = data.match(/["']next_action["']\s*:\s*["']([^"']+)["']/);
    if (match) {
      nextAction = match[1];
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-3 sm:mb-6">
        <p className="text-xs text-muted-foreground">
          We're deciding the best path to process your request.
        </p>
      </div>

      <div className="border-[.5px] my-3 sm:my-6 border-gray-200" />

      {/* Action Path Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 text-xs">
        <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
          Action Path
        </h3>
        <p className="font-medium text-foreground capitalize text-xs sm:text-sm break-words">
          {nextAction.replaceAll("_", " ")}
        </p>
      </div>

      {/* Alternate Routes Section */}
      {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
        <h3 className="font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Alternate Routes
        </h3>
        <p className="font-medium text-foreground">2 options evaluated</p>
      </div> */}

      {/* Next Step Indicator */}
      <div className="flex items-start sm:items-center gap-2 text-sm text-muted-foreground pt-2">
        <ArrowRight
          size={14}
          className="text-primary flex-shrink-0 mt-0.5 sm:mt-0 sm:w-4 sm:h-4"
        />
        <span className="text-xs break-words">
          Next: Extracting the main topic
        </span>
      </div>
    </div>
  );
};
