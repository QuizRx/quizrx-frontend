import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { Button } from "@/core/components/ui/button";
import { Separator } from "@/core/components/ui/separator";
import { ChevronDown, ChevronRight, Sparkles  } from "lucide-react";
import { Checkbox } from "@/core/components/ui/checkbox";
import { useChat } from "../../store/chat-store";
import { Streaming } from "./streaming";
import {
  Card,
  CardContent,
} from "@/core/components/ui/card";

const GET_TOPICS_QUERY = gql`
  query findAll {
    topics {
      _id
      id
      title
      description
      subtopics {
        _id
        title
        id
        description
      }
    }
  }
`;

const SEND_FORM_TOPIC_MUTATION = gql`
  mutation SendFormTopic($topics: [GenerateTopicsDto!]!) {
    sendFormTopic(topics: $topics) {
      _id
      createdAt
      description
      title
      updatedAt
      userId
    }
  }
`;

type GenerateTopicsDto = {
  topicId: string;
  allSubtopics?: boolean;
  subTopicsIds?: string[];
}

type Subtopic = {
  _id: string;
  title: string;
  id: string;
  description: string;
};

type Topic = {
  _id: string;
  title: string;
  description: string;
  id: string;
  subtopics: Subtopic[];
};

type CheckedState = {
  [topicId: string]: {
    checked: boolean;
    expanded: boolean;
    subtopics: { [subId: string]: boolean };
  };
};

const FormTopic: React.FC = () => {
  const { data, loading } = useQuery<{ topics: Topic[] }>(GET_TOPICS_QUERY);
  const [sending, setSending] = useState(false);
  const [checked, setChecked] = useState<CheckedState>({});
  const { startFormTopicStreaming } = useChat();
  useEffect(() => {
    if (data?.topics) {
      // Initialize checked state if not set
      setChecked((prev) => {
        const newState: CheckedState = { ...prev };
        data.topics.forEach((topic) => {
          if (!newState[topic._id]) {
            newState[topic._id] = {
              checked: false,
              expanded: false,
              subtopics: Object.fromEntries(
                topic.subtopics.map((s) => [s._id, false])
              ),
            };
          }
        });
        return newState;
      });
    }
  }, [data]);

  const handleTopicCheck = (topicId: string) => {
    setChecked((prev) => {
      const topic = prev[topicId];
      const newChecked = !topic.checked;
      return {
        ...prev,
        [topicId]: {
          ...topic,
          checked: newChecked,
          subtopics: Object.fromEntries(
            Object.entries(topic.subtopics).map(([sid]) => [sid, newChecked])
          ),
        },
      };
    });
  };

  const handleSubtopicCheck = (topicId: string, subId: string) => {
    setChecked((prev) => {
      const topic = prev[topicId];
      const newSubtopics = { ...topic.subtopics, [subId]: !topic.subtopics[subId] };
      const allChecked = Object.values(newSubtopics).every(Boolean);
      return {
        ...prev,
        [topicId]: {
          ...topic,
          checked: allChecked,
          subtopics: newSubtopics,
        },
      };
    });
  };

  const handleToggleExpand = (topicId: string) => {
    setChecked((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        expanded: !prev[topicId].expanded,
      },
    }));
  };

  // Helper to build topics array for mutation
  const buildSelectedTopics = (): GenerateTopicsDto[] => {
    if (!data?.topics) return [];
    return data.topics.reduce<GenerateTopicsDto[]>((acc, topic) => {
      const topicChecked = checked[topic._id]?.checked;
      const subtopicStates = checked[topic._id]?.subtopics || {};
      if (topicChecked) {
        // If topic is checked, send allSubtopics: true
        acc.push({ topicId: topic._id, allSubtopics: true });
      } else {
        // Otherwise, collect checked subtopics
        const selectedSubs = Object.entries(subtopicStates)
          .filter(([_, v]) => v)
          .map(([sid]) => sid);
        if (selectedSubs.length > 0) {
          acc.push({ topicId: topic._id, subTopicsIds: selectedSubs });
        }
      }
      return acc;
    }, []);
  };

  const handleStart = async () => {
    const topics = buildSelectedTopics();
    if (!topics.length) return;

    try {
      document.body.style.cursor = "wait";
      setSending(true);
      // NEW: use streaming route instead of mutation
      startFormTopicStreaming(topics, (threadId) => {
        // called on `batch_done`
        document.body.style.cursor = "default";
        setSending(false);
      });
    } catch (err) {
      console.error(err);
      document.body.style.cursor = "default";
    }
  };

  const checkedSubtopicCount = React.useMemo(() => {
    return Object.values(checked).reduce((sum, topic) => {
      return (
        sum + Object.values(topic.subtopics).filter(Boolean).length
      );
    }, 0);
  }, [checked]);

  return (
    <>
    {!sending ? (
      <Card className="w-full max-w-3xl">
          <CardContent>
    <div className="text-left">
      <div className="flex px-6 pt-6 gap-5 items-center">
        <Sparkles className="w-6 h-6 text-blue-500" />
        <div>
          <h2 className="text-xl font-bold">Generate a quiz from selection</h2>
          <div className="text-muted-foreground text-sm mt-1">
            Choose a topic and subtopics you’d like to include in your quiz
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="px-6 pb-6">
        {loading && <div>Loading topics...</div>}
        {!loading && data?.topics?.length === 0 && <div>No topics found.</div>}
        <div className="flex flex-col gap-2">
          {data?.topics.map((topic) => (
            <div key={topic._id} className="border rounded p-3 bg-white">
              <div className="flex items-center gap-2 justify-between cursor-pointer" onClick={() => handleToggleExpand(topic._id)}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={checked[topic._id]?.checked || false}
                    onCheckedChange={() => handleTopicCheck(topic._id)}
                    aria-label={`Select topic ${topic.title}`}
                    onClick={(e) => {e.stopPropagation();}}
                  />
                  <span className="font-medium"><span className="font-bold">{topic.id}. </span>{topic.title}</span>
                </div>
                <div
                  className="ml-2"
                  aria-label={checked[topic._id]?.expanded ? "Collapse" : "Expand"}
                >
                  {checked[topic._id]?.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>
              {checked[topic._id]?.expanded && (
                <div className="pl-7 mt-2 flex flex-col gap-1">
                  {topic.subtopics.map((sub) => (
                    <label key={sub._id} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked[topic._id]?.subtopics[sub._id] || false}
                        onCheckedChange={() => handleSubtopicCheck(topic._id, sub._id)}
                        aria-label={`Select subtopic ${sub.title}`}
                      />
                      <span><span className="font-bold">{sub.id} </span>{sub.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button type="button" onClick={handleStart}>
            {`Start ( ${checkedSubtopicCount} Selected )`}
          </Button>
        </div>
      </div>
    </div>
     </CardContent>
        </Card>
    ) : (<div className="w-full">
      <Streaming />
    </div>)}
     </>
  );
};

export default FormTopic;

