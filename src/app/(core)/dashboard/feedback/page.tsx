"use client";

import PageTitle from "@/core/components/shared/page-title";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useAuth } from "@/core/providers/auth";
import { FeedbackForm } from "@/modules/feedback/components/feedback-form";
import { GET_MY_FEEDBACK_QUERY } from "@/modules/feedback/apollo/query/feedback";
import {
  FEEDBACK_CATEGORY_LABEL,
  Feedback,
} from "@/modules/feedback/types/api/feedback";
import { useQuery } from "@apollo/client";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";

export default function FeedbackPage() {
  const { token } = useAuth();
  const { data, loading, refetch } = useQuery(GET_MY_FEEDBACK_QUERY, {
    variables: {
      pagination: { page: 1, limit: 10, orderBy: "desc" },
    },
    skip: !token,
    fetchPolicy: "cache-and-network",
  });

  const myFeedback: Feedback[] = data?.getMyFeedback?.data ?? [];

  return (
    <div className="flex flex-col w-full px-4 md:px-10 pb-10">
      <PageTitle
        title="Feedback"
        description="Tell us what's working and what isn't. Every note goes straight to the team."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        <div className="lg:col-span-2">
          <Card className="border border-zinc-200 shadow-sm">
            <CardHeader>
              <h2 className="text-xl font-semibold">Share your thoughts</h2>
              <p className="text-sm text-muted-foreground">
                Your feedback is private and only visible to the QuizRx team.
              </p>
            </CardHeader>
            <CardContent>
              <FeedbackForm
                variant="page"
                onSuccess={() => {
                  refetch();
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-zinc-200 shadow-sm h-full">
            <CardHeader>
              <h2 className="text-base font-semibold">Recent submissions</h2>
              <p className="text-xs text-muted-foreground">
                The last 10 things you've sent us.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {loading && myFeedback.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-dashed border-zinc-200 p-3"
                  >
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))
              ) : myFeedback.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven't sent any feedback yet.
                </p>
              ) : (
                myFeedback.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-md border border-zinc-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5"
                            fill={i < item.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {FEEDBACK_CATEGORY_LABEL[item.category] ?? item.category}
                    </p>
                    {item.message ? (
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                        {item.message}
                      </p>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">
                        No comment.
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
