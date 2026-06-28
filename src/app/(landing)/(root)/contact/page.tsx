"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Linkedin,
  Mail,
  MessageSquareHeart,
  Send,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";

const SUPPORT_EMAIL = "adminquizrx@gmail.com";

const FEEDBACK_HINTS = [
  "Was a question wrong, unclear, or missing context?",
  "Which calcium / bone chain should we improve first?",
  "What other modules would you like to see next?",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `QuizRx beta feedback - ${formData.name || "Anonymous"}`
    );
    const body = encodeURIComponent(
      `${formData.message}\n\n--\nFrom: ${formData.name || "(no name)"} <${
        formData.email || "(no email)"
      }>`
    );
    if (typeof window !== "undefined") {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-zinc-900">
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-6"
        >
          <span
            aria-hidden
            className="inline-block h-1 w-10 rounded-full bg-[var(--accent-amber,#E0B16A)]"
          />
          <h1 className="text-4xl font-semibold leading-tight text-[var(--primary)] md:text-5xl">
            Get in touch
            <span className="ml-3 inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 align-middle text-sm font-semibold">
              Beta
            </span>
          </h1>
          <p className="text-base leading-relaxed text-zinc-700 md:text-lg">
            QuizRx is in closed beta. Your notes, bug reports, and ideas shape
            what we ship next - the team reads every message that comes in.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-amber,#E0B16A)]/30 text-[var(--primary)]">
                <Mail className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                Email us
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-1 block text-base font-medium text-zinc-800 hover:text-[var(--primary)]"
              >
                {SUPPORT_EMAIL}
              </a>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                We respond from the same address - feel free to write directly
                if a form isn't your style.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-amber,#E0B16A)]/30 text-[var(--primary)]">
                <MessageSquareHeart className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                What's most useful
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                {FEEDBACK_HINTS.map((hint) => (
                  <li key={hint} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                Follow along
              </p>
              <p className="mt-2 text-sm text-zinc-700">
                We share beta updates on LinkedIn while we build out the next
                modules.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 rounded-full border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm md:p-10"
          >
            {isSubmitted ? (
              <div className="flex flex-col items-start gap-4 py-8">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-amber,#E0B16A)]/30 text-[var(--primary)]">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <h2 className="text-2xl font-semibold text-[var(--primary)]">
                  Thanks - your draft is on its way
                </h2>
                <p className="max-w-lg text-sm leading-relaxed text-zinc-600">
                  We opened your email client with a draft addressed to{" "}
                  <span className="font-medium text-zinc-800">
                    {SUPPORT_EMAIL}
                  </span>
                  . If nothing happened, copy the message and send it from your
                  preferred client.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="rounded-full border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                  >
                    Send another
                  </Button>
                  <Button
                    asChild
                    className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                  >
                    <Link href="/chat">
                      Back to chat
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--primary)] md:text-2xl">
                    Send us a note
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    Bug, idea, or just curious - we'd love to hear from you.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-zinc-700"
                    >
                      Your name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Dr. Jane Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="rounded-xl border-zinc-200 bg-white focus-visible:ring-[var(--primary)]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-zinc-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="rounded-xl border-zinc-200 bg-white focus-visible:ring-[var(--primary)]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium text-zinc-700"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us what happened, what you liked, or what should come next..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="resize-none rounded-xl border-zinc-200 bg-white focus-visible:ring-[var(--primary)]"
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send message
                  </Button>
                  <p className="text-xs text-zinc-500">
                    This opens an email draft addressed to our team.
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
