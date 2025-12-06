import { Info, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";

export const LabelWithTooltip = ({
  label,
  tooltipText,
}: {
  label: string;
  tooltipText: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-[0.9rem] w-[0.9rem] cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
