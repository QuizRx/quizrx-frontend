"use client";

import { Separator } from "@/core/components/ui/separator";
import PageTitle from "@/core/layouts/common/page-title";
import KnowledgeGapChart from "@/modules/chat/layouts/dashboard/performance-insight/knowledge-gap-chart";
import MetricCards from "@/modules/chat/layouts/dashboard/performance-insight/metric-card";
import DashboardComponents from "@/modules/chat/layouts/dashboard/performance-insight/performace-insight-components";
import ScoreProgressChart from "@/modules/chat/layouts/dashboard/performance-insight/score-progress-bar";

export default function Page() {
  return (
    <div className="w-full p-4 flex flex-col gap-4 h-[90vh]">
      <PageTitle
         title="Performance Insights"
        description="Track your learning progress and identify knowledge gaps."
      />

      <DashboardComponents/>
    </div>
  );
}
