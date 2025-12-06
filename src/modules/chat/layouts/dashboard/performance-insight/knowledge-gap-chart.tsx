"use client";

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";

const data = [
  { topic: "Endocrinology", value: 88 },
  { topic: "Thyroid H.", value: 19 },
  { topic: "Parathyroid", value: 52 },
  { topic: "Diabetes Mellitus", value: 57 },
  { topic: "Metabolic Syndrome", value: 71 },
  { topic: "Parathyroid", value: 24 },
];

export default function KnowledgeGapChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>
          Knowledge Gap Per Topic -Accuracy Percentage
        </CardTitle>
        <CardDescription className="text-xs">
          January - June 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 30, right: 10, left: 10, bottom: 20 }}
              barCategoryGap={10}

            >
              <XAxis
                dataKey="topic"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis hide={true} domain={[0, 100]} />
              <Bar
                dataKey="value"
                fill="#0D7DF2"
                radius={[0, 0, 0, 0]}
                barSize={40}
                label={{
                  position: "top",
                  formatter: (value: any) => `${value}%`,
                  fill: "#000",
                  fontSize: 12,
                  fontWeight: "bold",
                 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Showing total Topics for the last 6 months
        </div>
        <div className="flex items-center gap-1 text-xs font-medium">
          <span>Trending up by 5.2% this month</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </CardFooter>
    </Card>
  );
}
