// src/components/ActiveFilters.jsx
"use client";

import { X } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import useFilterStore from "../../store/filter-store";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_USER_QUESTION_BANKS_QUERY } from "../../apollo/query/question-bank";

export default function ActiveFilters() {
  const { topic, difficulty, setTopic, setDifficulty } = useFilterStore();
  const [topics, setTopics] = useState<string[]>(["all"]);

  // Fetch question banks data
  const { data } = useQuery(GET_USER_QUESTION_BANKS_QUERY);

  useEffect(() => {
    if (data?.getUserQuestionBanks?.data) {
      const allTags = data.getUserQuestionBanks.data.flatMap(
        (bank: any) => bank.tags || []
      );
      const uniqueTags = [...new Set(allTags)].filter(Boolean);
      setTopics(["all", ...uniqueTags]);
    }
  }, [data]);

  const getTopicLabel = (topicValue: string) => {
    if (topicValue === "all") return "All Topics";
    const topicExists = topics.includes(topicValue);
    return topicExists
      ? topicValue.charAt(0).toUpperCase() + topicValue.slice(1)
      : topicValue; // fallback if topic isn't in the list
  };

  const getDifficultyLabel = (difficultyValue: string) => {
    if (difficultyValue === "all") return "All Levels";
    return difficultyValue.charAt(0).toUpperCase() + difficultyValue.slice(1);
  };

  const activeFiltersCount =
    (topic !== "all" ? 1 : 0) + (difficulty !== "all" ? 1 : 0);

  if (activeFiltersCount === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {topic !== "all" && (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 py-1 px-3"
        >
          Topic: {getTopicLabel(topic)}
          <button
            className="ml-1 text-blue-500 hover:text-blue-700"
            onClick={() => setTopic("all")}
            aria-label={`Remove ${topic} filter`}
          >
            <X size={14} />
          </button>
        </Badge>
      )}
      {difficulty !== "all" && (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 py-1 px-3"
        >
          Difficulty: {getDifficultyLabel(difficulty)}
          <button
            className="ml-1 text-blue-500 hover:text-blue-700"
            onClick={() => setDifficulty("all")}
            aria-label={`Remove ${difficulty} filter`}
          >
            <X size={14} />
          </button>
        </Badge>
      )}
    </div>
  );
}
