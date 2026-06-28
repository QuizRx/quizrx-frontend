"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bone,
  ClipboardCheck,
  Compass,
  HeartPulse,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";

const principles = [
  {
    icon: ClipboardCheck,
    title: "Clinician-authored content",
    description:
      "Every chain in this beta was written and reviewed by a clinician. The model does not invent questions - it only navigates the chain you pick.",
  },
  {
    icon: Sparkles,
    title: "Deterministic by design",
    description:
      "Same chain, same question, same answer - so we can measure quality and you can study without surprises.",
  },
  {
    icon: MessageSquareHeart,
    title: "Feedback in the loop",
    description:
      "Thumbs up / down and a free-text box on every question. Your notes go straight to the people building QuizRx.",
  },
];

const chains = [
  "Calcium & Bone Physiology",
  "Osteoporosis",
  "Osteomalacia",
  "Hypercalcaemia",
  "Hypocalcaemia",
  "Primary Hyperparathyroidism",
  "Paget's Disease",
  "Osteogenesis Imperfecta",
  "Renal Osteodystrophy",
];

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
            <span
              aria-hidden
              className="inline-block h-1 w-10 rounded-full bg-[var(--accent-amber,#E0B16A)]"
            />
            <h1 className="text-4xl font-semibold leading-tight text-[var(--primary)] md:text-5xl">
              About QuizRx
              <span className="ml-3 inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 align-middle text-sm font-semibold">
                Beta
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-700 md:text-lg">
              QuizRx is a focused medical learning tool. The closed beta covers
              one module - calcium and bone disorders - with clinician-authored
              decision chains. We use a model only to route you through those
              chains, never to generate clinical content.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[var(--primary)] px-6 hover:bg-[var(--primary)]/90"
              >
                <Link href="/auth/login">
                  Try the beta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <Link href="/contact">Get in touch</Link>
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
                Beta scope
              </p>
              <p className="mt-2 text-lg font-medium text-zinc-800">
                One module. Nine chains. Live now.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                <li className="flex items-center gap-2">
                  <Bone className="h-4 w-4 text-[var(--primary)]" />
                  Calcium &amp; Bone disorders
                </li>
                <li className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-[var(--primary)]" />
                  Clinician-reviewed answers
                </li>
                <li className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[var(--primary)]" />
                  No LLM-generated questions
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-zinc-200/70 bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold text-[var(--primary)]">
            How we built it
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-700 md:text-base">
            Passive PDFs and infinite question banks were never quite right for
            us. QuizRx narrows things down: pick a chain, work through
            decision points written by someone who actually treats these
            patients, and tell us what landed. The beta is small on purpose.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {principles.map((point) => (
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
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <span
              aria-hidden
              className="inline-block h-1 w-10 rounded-full bg-[var(--accent-amber,#E0B16A)]"
            />
            <h2 className="mt-4 text-2xl font-semibold text-[var(--primary)] md:text-3xl">
              What's in this module
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700 md:text-base">
              Nine pre-authored chains, roughly 234 decision points, all
              tagged to calcium and bone. The list will grow with the next
              module - but only after this one is solid.
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
            <ul className="grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-2">
              {chains.map((chain) => (
                <li
                  key={chain}
                  className="flex items-start gap-2 rounded-xl bg-[var(--primary)]/5 px-3 py-2"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-amber,#E0B16A)]"
                  />
                  <span>{chain}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-[var(--primary)]">
            Help us shape what comes next
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-700 md:text-base">
            Spotted a question that wasn't great? Have a module you'd like to
            see next? The team reads every message during the beta.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            >
              <Link href="/contact">Send feedback</Link>
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
