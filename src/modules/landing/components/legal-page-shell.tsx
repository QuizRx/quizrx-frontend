"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] pt-32 pb-20">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-6"
      >
        <span
          aria-hidden
          className="mb-4 inline-block h-1 w-10 rounded-full bg-[var(--accent-amber,#E0B16A)]"
        />
        <h1 className="text-3xl font-semibold text-[var(--primary)] md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {lastUpdated}</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[var(--primary)] [&_a]:text-[var(--primary)] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
          {children}
        </div>
      </motion.article>
    </div>
  );
}
