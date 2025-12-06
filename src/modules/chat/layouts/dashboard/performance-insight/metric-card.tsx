import {
  ArrowUpIcon,
  BarChart3Icon,
  ClockIcon,
  PercentIcon,
  HelpCircleIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";

export default function MetricCards() {
  const metricCardsData = [
    {
      title: "Total Questions Generated",
      icon: BarChart3Icon,
      value: "145",
      description: "from last month",
      change: {
        value: "20.1%",
        direction: "up",
      },
      color: "#1E88E5",
    },
    {
      title: "Overall Accuracy",
      icon: PercentIcon,
      value: "79%",
      description: "from last month",
      change: {
        value: "19%",
        direction: "up",
      },
      color: "#1E88E5",
    },
    {
      title: "Average Question Difficulty",
      icon: HelpCircleIcon,
      value: "Medium",
      description: "Improved from last month",
      change: null, // No change indicator for this card
      color: "#1E88E5",
    },
    {
      title: "Average Time per Question",
      icon: ClockIcon,
      value: "15s",
      description: "since last host",
      change: {
        value: "201",
        direction: "up",
      },
      color: "#1E88E5",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCardsData.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {metric.change && (
                <span className="inline-flex items-center ">
                  {metric.change.direction === "up" && (
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                  )}
                  {metric.change.value}
                </span>
              )}{" "}
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
