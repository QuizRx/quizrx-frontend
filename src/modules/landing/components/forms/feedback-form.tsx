"use client";

import { useMutation } from "@apollo/client";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Textarea } from "@/core/components/ui/textarea";
import { SUBMIT_BETA_FEEDBACK_MUTATION } from "@/modules/landing/apollo/mutation/beta-feedback";
import {
  BETA_FEEDBACK_REASONS,
  type BetaFeedbackReason,
} from "@/modules/landing/types/beta-feedback";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<BetaFeedbackReason | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [submitBetaFeedback, { loading }] = useMutation(
    SUBMIT_BETA_FEEDBACK_MUTATION,
    {
      onCompleted: () => setSubmitted(true),
      onError: () =>
        setError(
          "Sorry, we couldn't send your message just now. Please try again."
        ),
    }
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError(null);

    if (!name.trim() || !email.trim() || !reason || !message.trim()) {
      setError("Please fill in every field before sending.");
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    await submitBetaFeedback({
      variables: {
        input: {
          name: name.trim(),
          email: email.trim(),
          reason,
          message: message.trim(),
        },
      },
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm md:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="text-2xl font-semibold text-[var(--primary)]">
          Thanks for your feedback
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-zinc-600">
          We&apos;ve received your message and read every note during the beta.
        </p>
        <Button
          variant="outline"
          className="rounded-full border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setReason("");
            setMessage("");
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm md:p-10"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="feedback-name">Name</Label>
          <Input
            id="feedback-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Jane Doe"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-email">Email address</Label>
          <Input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback-reason">Reason</Label>
        <Select
          value={reason}
          onValueChange={(value) => setReason(value as BetaFeedbackReason)}
        >
          <SelectTrigger id="feedback-reason" className="rounded-xl">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {BETA_FEEDBACK_REASONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback-message">Message</Label>
        <Textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what happened, what you liked, or what should come next..."
          rows={6}
          maxLength={4000}
          className="resize-none rounded-xl"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <Button
        type="submit"
        size="lg"
        loading={loading}
        className="rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
      >
        Send Feedback
      </Button>
    </form>
  );
}
