import { Button } from "@/core/components/ui/button";
import { ProjectLogo } from "@/core/components/ui/logo";

const CanvasTopBar = () => {
  return (
    <div className="flex flex-row w-full justify-between py-2 px-5 border-b border-2 h-auto bg-blue-50">
      <ProjectLogo
        includeText
        className="max-sm:gap-2"
        textClassName="max-sm:text-xs text-sm font-semibold"
        size={24}
      />
      {/* <div className="max-sm:hidden flex flex-col items-center">
        <h1 className="font-medium">Concept Flow</h1>
        <p className="text-muted-foreground text-xs">Draft</p>
      </div> */}
      <div className="flex flex-row gap-2 lg:gap-4">
        <Button variant="outline" className="h-8 md:h-10 px-8 md:px-10">
          Save
        </Button>
        <Button className="h-8 md:h-10 px-8 md:px-10">Run</Button>
      </div>
    </div>
  );
};

export default CanvasTopBar;
