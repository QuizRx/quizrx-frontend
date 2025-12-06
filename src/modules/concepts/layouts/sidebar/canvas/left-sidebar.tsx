import { Button } from "@/core/components/ui/button";
import { ProjectLogo } from "@/core/components/ui/logo";

const LeftSideBar = () => {
  return (
    <div className=" flex flex-row justify-between pt-2 px-5">
      <ProjectLogo
        includeText
        className="max-sm:gap-2"
        textClassName="max-sm:text-xs text-sm font-semibold"
        size={24}
      />
      <div className="max-sm:hidden flex flex-col items-center">
        <h1 className="font-medium">Loan Approval Automation</h1>
        <p className="text-muted-foreground text-xs">Draft</p>
      </div>
      <div className="flex flex-row gap-2 lg:gap-4">
        <Button variant="outline" size={"lg"}>
          Save
        </Button>
        <Button size={"lg"}>Run</Button>
      </div>
    </div>
  );
};

export default LeftSideBar;
