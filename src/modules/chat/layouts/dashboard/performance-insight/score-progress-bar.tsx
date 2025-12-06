"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
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
  { day: "Mon", score: 65 },
  { day: "Tue", score: 75 },
  { day: "Wed", score: 70 },
  { day: "Thu", score: 45 },
  { day: "Fri", score: 40 },
  { day: "Sat", score: 55 },
  { day: "Sun", score: 70 },
];

export default function ScoreProgressChart() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Score Progress Over Time</CardTitle>
        <CardDescription className="text-xs">Past 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="1 0"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0D7DF2"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            </LineChart>
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
