import { Button } from "@/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { Plus } from "lucide-react";

export function StartPopover() {
  const startProjects = ["New Project", "Start from Template"];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-48 h-12">
          <Plus className="h-6 w-6 text-white" />
          Start
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="flex flex-col gap-1">
          {startProjects.map((projects) => (
            <Button
              variant="ghost"
              key={projects}
              className="w-full justify-start text-xs text-primary"
            >
              <Plus className="h-6 w-6 " />
              {projects}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
