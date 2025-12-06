import { Button } from "@/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { Plus } from "lucide-react";
import { useState } from "react";
import PipelineDialogForm from "../../layouts/forms/pipeline";

export function StartProjectPopover() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="w-48 h-12">
            <Plus className="h-6 w-6" />
            New Concept
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs font-thin"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-6 w-6 " />
              New
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs font-thin"
            >
              <Plus className="h-6 w-6 " />
              Start From Template
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <PipelineDialogForm isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
}
