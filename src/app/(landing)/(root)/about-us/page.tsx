"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { FEATURE_CARDS } from "@/modules/landing/data/feature-cards";

const BETA_AT_A_GLANCE = [
  "Built by a board-certified physician",
  "AI-assisted question generation",
  "One focused learning module",
  "Your feedback shapes future releases",
] as const;

export default function AboutUsPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-zinc-900">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_320px] md:items-center"
        >
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 text-sm font-semibold text-[var(--primary)]">
              Beta
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-[var(--primary)] md:text-5xl">
              About QuizRx
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-700 md:text-lg">
              QuizRx is a medical learning platform built to help physicians
              strengthen their clinical thinking through carefully designed
              questions and detailed explanations. This closed beta introduces
              our first module, Calcium &amp; Bone, and your feedback will help
              shape what comes next.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
              >
                <Link href="/auth/login">
                  Try the Beta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <Link href="/feedback">Send feedback</Link>
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden md:block"
          >
            <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                Beta at a Glance
              </p>
              <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                {BETA_AT_A_GLANCE.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-zinc-200/70 bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold text-[var(--primary)]">
            Our Approach
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-700 md:text-base">
            We believe meaningful learning comes from thinking, not memorizing.
            QuizRx is designed to help you work through clinical problems,
            understand the reasoning behind each answer, and build confidence one
            question at a time.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURE_CARDS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-amber,#E0B16A)]/30 text-[var(--primary)]">
                  <point.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-medium text-zinc-900">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-[var(--primary)]">
            Help Shape What Comes Next
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-700 md:text-base">
            Found something confusing? Have an idea for QuizRx? We&apos;d love to
            hear from you. Every message helps improve future versions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            >
              <Link href="/feedback">Send feedback</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10"
            >
              <Link href="/privacy-policy">Privacy notice</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
