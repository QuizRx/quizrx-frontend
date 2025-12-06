"use client";

import { Separator } from "@/core/components/ui/separator";
import PageTitle from "@/core/layouts/common/page-title";
import { StartProjectPopover } from "@/modules/concepts/components/popover/start-project";
import HowToUse from "@/modules/concepts/layouts/overview/how-to-use";
import { Templates } from "@/modules/concepts/layouts/overview/templates";
import { PipelineTable } from "@/modules/concepts/layouts/tables/pipeline";

export default function Page() {
  return (
    <div className="mx-auto px-4 py-6">
      <PageTitle
        title="Create Concepts"
        description="Let's start building your concepts! You can create a new concept from scratch or use one of our templates to get started quickly."
        action={<StartProjectPopover />}
      />
      <PipelineTable/>
      <HowToUse />
      <Separator className="my-15" />
      <Templates />
    </div>
  );
}
