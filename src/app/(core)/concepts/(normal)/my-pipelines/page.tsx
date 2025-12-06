"use client";

import PageTitle from "@/core/layouts/common/page-title";
import { PipelineTable } from "@/modules/concepts/layouts/tables/pipeline";
import { useRouter } from "next/navigation";

export default function Page() {
  return (
    <div className="mx-auto px-4 py-6">
      <PageTitle
        title={"My Pipelines"}
        description={"Recently Started Pipelines"}
      />
      <PipelineTable />
    </div>
  );
}
