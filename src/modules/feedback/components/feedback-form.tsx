"use client";

import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Textarea } from "@/core/components/ui/textarea";
import { toast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import { useMutation } from "@apollo/client";
import { Loader2, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { SUBMIT_FEEDBACK_MUTATION } from "../apollo/mutation/feedback";
import {
  FEEDBACK_CATEGORY_LABEL,
  FeedbackCategory,
  SubmitFeedbackInput,
} from "../types/api/feedback";
import {
  markFeedbackPromptShown,
  markFeedbackPromptSnoozed,
} from "../utils/prompt-storage";

type FeedbackFormProps = {
  className?: string;
  variant?: "page" | "compact";
  initialCategory?: FeedbackCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function FeedbackForm({
  className,
  variant = "page",
  initialCategory,
  onSuccess,
  onCancel,
  showCancel = false,
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>(
    initialCategory ?? FeedbackCategory.GENERAL
  );
  const [message, setMessage] = useState<string>("");

  const [submitFeedback, { loading }] = useMutation(SUBMIT_FEEDBACK_MUTATION, {
    onCompleted: () => {
      // Reset cooldown so we don't immediately re-prompt the user.
      markFeedbackPromptShown();
      toast({
        title: "Thanks for your feedback",
        description: "Your input helps us improve QuizRx.",
      });
      setRating(0);
      setHoverRating(0);
      setMessage("");
      setCategory(initialCategory ?? FeedbackCategory.GENERAL);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to submit feedback:", error);
      toast({
        title: "Could not send feedback",
        description: error.message || "Please try again in a moment.",
      });
    },
  });

  const categories = useMemo(
    () =>
      (Object.values(FeedbackCategory) as FeedbackCategory[]).map((value) => ({
        value,
        label: FEEDBACK_CATEGORY_LABEL[value],
      })),
    []
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (rating < 1) {
      toast({
        title: "Pick a rating",
        description: "Tap a star so we know how you feel.",
      });
      return;
    }

    const trimmed = message.trim();
    const input: SubmitFeedbackInput = {
      rating,
      category,
      message: trimmed.length > 0 ? trimmed : undefined,
      pagePath:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };

    await submitFeedback({ variables: { input } });
  };

  const handleSnooze = () => {
    markFeedbackPromptSnoozed();
    onCancel?.();
  };

  const displayedRating = hoverRating || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">
          How would you rate your experience?
        </Label>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Rating"
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = value <= displayedRating;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  className={cn(
                    "transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1",
                    filled ? "text-yellow-500" : "text-zinc-300"
                  )}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                  disabled={loading}
                >
                  <Star
                    className={cn(
                      "h-7 w-7",
                      variant === "compact" && "h-6 w-6"
                    )}
                    fill={filled ? "currentColor" : "none"}
                  />
                </button>
              );
            })}
          </div>
          {displayedRating > 0 && (
            <span className="text-sm text-muted-foreground">
              {RATING_LABELS[displayedRating]}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="feedback-category" className="text-sm font-medium">
          Category
        </Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as FeedbackCategory)}
          disabled={loading}
        >
          <SelectTrigger id="feedback-category" className="w-full">
            <SelectValue placeholder="Pick a category" />
          </SelectTrigger>
          <SelectContent className="z-70">
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="feedback-message" className="text-sm font-medium">
          Anything you'd like to share?{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What worked well? What could be better?"
          rows={variant === "compact" ? 3 : 5}
          maxLength={2000}
          disabled={loading}
        />
        <span className="text-xs text-muted-foreground self-end">
          {message.length} / 2000
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {showCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleSnooze}
            disabled={loading}
          >
            Maybe later
          </Button>
        )}
        <Button type="submit" disabled={loading || rating < 1} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Sending..." : "Send feedback"}
        </Button>
      </div>
    </form>
  );
}
