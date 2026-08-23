"use client";

import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { FeedbackForm } from "@/modules/landing/components/forms/feedback-form";

const SUPPORT_EMAIL = "beta@quizrx.ai";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-zinc-900">
      <section className="mx-auto max-w-3xl px-6 pb-12 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <span
            aria-hidden
            className="inline-block h-1 w-10 rounded-full bg-[var(--accent-amber,#E0B16A)]"
          />
          <h1 className="text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl md:text-5xl">
            Feedback
          </h1>
          <p className="text-base leading-relaxed text-zinc-700 md:text-lg">
            Have a question, found a bug, or have an idea? We&apos;d love to hear
            from you.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            <Mail className="h-4 w-4" />
            {SUPPORT_EMAIL}
          </a>
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FeedbackForm />
        </motion.div>
      </section>
    </div>
  );
}
