"use client";

import PageTitle from "@/core/layouts/common/page-title";
import { FileEmbeddingTable } from "@/modules/graph/layouts/tables/file-embedding";

export default function GraphProcessingPage() {
  return (
    <div className="mx-auto px-4 py-6">
      <PageTitle
        title={"Graph Processing"}
        description={"Select a file to embed!"}
      />

      <FileEmbeddingTable />
    </div>
  );
}
