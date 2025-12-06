"use client";

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Line,
  LineChart,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  ArrowUpIcon,
  BarChart3Icon,
  ClockIcon,
  PercentIcon,
  HelpCircleIcon,
  TrendingUp,
  Target
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { gql, useQuery } from "@apollo/client";
import { use, useEffect } from "react";

// Skeleton Loader
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`animate-pulse bg-gray-100 border-0 shadow-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
        <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
        <div className="h-8 w-8 bg-gray-300 rounded-lg" />
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-8 w-20 bg-gray-300 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );
}

function SkeletonChart({ className = "" }: { className?: string }) {
  return (
    <Card className={`animate-pulse bg-gray-100 border-0 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-300 rounded-lg" />
          <div>
            <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[355px] w-full bg-gray-200 rounded" />
      </CardContent>
      <CardFooter className="pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between w-full">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}


export function KnowledgeGapChart({ loading, data, trend }: { loading?: boolean; data?: { topic: string; value: number; color?: string }[]; trend?: number }) {
  if (loading) return <SkeletonChart />;
  // Assign a unique color to each bar based on its index, using a large palette
  const colorPalette = [
    "#3B82F6", "#EF4444", "#F59E0B", "#10B981", "#6366F1", "#F472B6", "#FBBF24", "#8B5CF6", "#34D399", "#F87171", "#60A5FA", "#A78BFA", "#FDE68A", "#6EE7B7", "#FCA5A5", "#818CF8", "#F9A8D4", "#FCD34D", "#C4B5FD", "#FECACA"
  ];
  const chartData = (data || []).map((item, idx) => ({
    ...item,
    topic: item.topic.length > 18 ? item.topic.slice(0, 15) + '…' : item.topic,
    color: colorPalette[idx % colorPalette.length],
  }));
  // Determine trend color and label
  const isPositive = typeof trend === 'number' && trend > 0;
  const isNegative = typeof trend === 'number' && trend < 0;
  const trendColor = isPositive ? 'text-green-600 bg-green-50' : isNegative ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-100';
  const trendIconClass = isPositive ? '' : isNegative ? 'rotate-180' : '';
  const trendLabel = typeof trend === 'number' ? `${isPositive ? '+' : ''}${trend}% this month` : 'No change';

  return (
    <Card className="col-span-1 bg-transparent border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Knowledge Gap Analysis
            </CardTitle>
            <CardDescription className="text-sm text-blue-600 font-medium">
              Accuracy by Topic • January - {new Date().toLocaleString('en', { month: 'long' })} {new Date().getFullYear()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[355px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 15, left: 15, bottom: 40 }}
              barCategoryGap={8}
            >
              <XAxis
                dataKey="topic"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                hide={true}
                domain={[0, 100]}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                barSize={35}
                label={{
                  position: "top",
                  formatter: (value: any) => `${value}%`,
                  fill: "#1F2937",
                  fontSize: 12,
                  fontWeight: "600",
                  offset: 5
                }}
                // Use a function to set fill color per bar
                // @ts-ignore
                shape={(props: any) => {
                  const { x, y, width, height, index } = props;
                  const color = chartData[index]?.color || colorPalette[0];
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={6}
                      fill={color}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-600">
            Performance overview across all topics
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${trendColor}`}>
            <TrendingUp className={`h-4 w-4 ${trendIconClass}`} />
            <span>{trendLabel}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// Metric Cards Component
export function MetricCards({ loading, data }: { loading?: boolean; data?: any[] }) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  // Map backend data to UI cards, with special logic for Average Difficulty
  const metricCardsData = (data || []).map((metric: any) => {
    if (metric.title === "Average Difficulty") {
      let description = "";
      if (metric.change) {
        const val = Number(metric.change);
        if (val > 0) description = "Improved";
        else if (val < 0) description = "Decreased";
        else description = "Same";
      } else {
        description = "Same";
      }
      return {
        ...metric,
        description: description + " " + metric.description,
        change: null, // Don't show the number
      };
    }
    return metric;
  });

  // Icon mapping by card title
  const iconMap: { [key: string]: React.ReactNode } = {
    "Total Questions Generated": <BarChart3Icon className="h-4 w-4 text-white" />,
    "Overall Accuracy": <PercentIcon className="h-4 w-4 text-white" />,
    "Average Difficulty": <HelpCircleIcon className="h-4 w-4 text-white" />,
    "Avg Time per Question": <ClockIcon className="h-4 w-4 text-white" />,
  };

  const unitMap: { [key: string]: string } = {
    "Overall Accuracy": "%",
    "Avg Time per Question": "sec",
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metricCardsData.map((metric, index) => {
        let changeValue = metric.change;
        let changeNum = Number(changeValue);
        let isNegative = !isNaN(changeNum) && changeNum < 0;
        return (
          <Card
            key={index}
            className={`relative overflow-hidden bg-transparent  border-0 shadow-sm hover:shadow-md transition-all duration-300 group`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 `}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-sm font-semibold text-gray-700 leading-tight">
                {metric.title}
              </CardTitle>
              <div className={`p-2 bg-blue-500 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                {iconMap[metric.title] || <BarChart3Icon className="h-4 w-4 text-white" />}
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-2">
                <div className={`text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-black`}>
                  {metric.value} {unitMap[metric.title] || ""}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {metric.change && (
                    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full">
                      {isNegative ? (
                        <ArrowUpIcon className="h-3 w-3 text-red-600 rotate-180" />
                      ) : (
                        <ArrowUpIcon className="h-3 w-3 text-green-600" />
                      )}
                      <span className={`font-semibold ${isNegative ? 'text-red-700' : 'text-green-700'}`}>{Math.abs(changeNum)}%</span>
                    </div>
                  )}
                  <span className="text-gray-600">{metric.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Score Progress Chart Component
export function ScoreProgressChart({ loading, data }: { loading?: boolean; data?: { day: string; score: number }[] }) {
  if (loading) return <SkeletonChart />;

  // Map backend data (with ISO date strings) to week days, always showing the last 7 days ending today
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  // Build an array of the last 7 days (dates and weekday labels)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      weekDay: weekDays[d.getDay()],
    };
  });
  // Build a map from date string to score
  const dateToScore = new Map<string, number>();
  (data || []).forEach(item => {
    dateToScore.set(item.day, item.score);
  });
  const scoreProgressData = last7Days.map(({ date, weekDay }) => ({
    day: weekDay,
    score: dateToScore.get(date) ?? 0,
  }));

  const averageScore = scoreProgressData.length > 0
    ? Math.round(scoreProgressData.reduce((acc, item) => acc + item.score, 0) / scoreProgressData.length)
    : 0;
  const trend = scoreProgressData.length > 1
    ? scoreProgressData[scoreProgressData.length - 1].score > scoreProgressData[0].score
    : false;
  const bestDay = scoreProgressData.reduce((max, item) => item.score > max ? item.score : max, 0);

  return (
    <Card className="col-span-1 bg-transparent border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Score Progress
            </CardTitle>
            <CardDescription className="text-sm text-blue-500 font-medium">
              Performance Trend • Past 7 days
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Average Score</div>
            <div className="text-2xl font-bold text-black-500">{averageScore}%</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Best Day</div>
            <div className="text-2xl font-bold text-black-500">{bestDay}%</div>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={scoreProgressData}
              margin={{ top: 20, right: 15, left: 15, bottom: 20 }}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="#E0E7FF"
                strokeDasharray="2 2"
              />
               <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", stroke: "#FFFFFF", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#3B82F6", strokeWidth: 2, fill: "#FFFFFF" }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-indigo-200">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-600">
            Weekly performance summary
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${
            trend
              ? 'text-green-600 bg-green-50'
              : 'text-red-600 bg-red-50'
          }`}>
            <ArrowUpRight className={`h-4 w-4 ${trend ? '' : 'rotate-180'}`} />
            <span>{trend ? 'Improving' : 'Declining'} trend</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// GraphQL Query for Performance Dashboard
const GET_PERFORMANCE_DASHBOARD = gql`
  query GetPerformanceDashboard {
    GetPerformanceDashboard {
      metricCards {
        title
        value
        description
        change
      }
      knowledgeGap {
        trend
        chart {
          topic
          value
        }
      }
      scoreProgress {
        day
        score
      }
    }
  }
`;

export function PerformanceDashboardQueryLogger() {
  
}

// Export all components
export default function DashboardComponents() {
  const { data, loading, error } = useQuery(GET_PERFORMANCE_DASHBOARD);
  useEffect(() => {
    console.log("Performance Dashboard Data:", data);
  }, [data]);
  return (
    <div className="space-y-8 p-6">
      <MetricCards loading={loading} data={data?.GetPerformanceDashboard.metricCards} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KnowledgeGapChart 
          loading={loading} 
          data={data?.GetPerformanceDashboard.knowledgeGap.chart} 
          trend={data?.GetPerformanceDashboard.knowledgeGap.trend}
        />
        <ScoreProgressChart loading={loading} data={data?.GetPerformanceDashboard.scoreProgress} />
      </div>
    </div>
  );
}