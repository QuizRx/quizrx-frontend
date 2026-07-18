"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, MessageSquareHeart, Sparkles, Stethoscope } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { useAuth } from "@/core/providers/auth";

const featurePoints = [
  {
    icon: Stethoscope,
    title: "Calcium & bone, focused",
    description:
      "Focused coverage of the high-yield calcium and bone disorders, with nothing extra to wade through.",
  },
  {
    icon: Sparkles,
    title: "Clinician-written questions",
    description:
      "Every question is written and reviewed by clinicians — consistent, repeatable, and exam-grade.",
  },
  {
    icon: MessageSquareHeart,
    title: "Beta feedback loop",
    description:
      "Thumbs and a comment box on every question feed straight back to the team building QuizRx.",
  },
] as const;

export default function BetaLandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // The marketing landing should funnel logged-in users straight to the
  // app. Other landing-area pages (/about-us, /contact, /privacy-policy,
  // /cookies-policy) are still accessible while signed in.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-zinc-900">
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-32 md:pt-40">
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
              Calcium &amp; Bone Module
              <span className="ml-3 inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 align-middle text-sm font-semibold">
                Beta
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-700 md:text-lg">
              Welcome to the closed beta of QuizRx. The first module covers calcium
              and bone disorders only. Pick a topic, ask for a question or get
              quizzed, and tell us how it lands - your feedback shapes what we
              ship next.
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
                <Link href="/about-us">Learn more</Link>
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
                Today's beta
              </p>
              <p className="mt-2 text-lg font-medium text-zinc-800">
                9 topics. 200+ practice questions. Live now.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                <li>- Calcium &amp; Bone Physiology</li>
                <li>- Osteoporosis &amp; Osteomalacia</li>
                <li>- Hyper / Hypocalcaemia</li>
                <li>- Primary Hyperparathyroidism</li>
                <li>- Paget's, Osteogenesis Imperfecta, more</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-zinc-200/70 bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold text-[var(--primary)]">
            What's in the beta
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featurePoints.map((point) => (
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
            Help us shape QuizRx
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-700 md:text-base">
            Spot a question that wasn't great? A topic we should cover next?
            Send a note any time - the team reads everything during beta.
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
