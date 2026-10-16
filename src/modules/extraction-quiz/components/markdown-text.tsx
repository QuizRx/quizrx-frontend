"use client";

import Markdown, { type Components } from "react-markdown";
import { cn } from "@/core/lib/utils";

// Learner-facing content keeps its line breaks (lab values, short lists), and
// "•" bullets from the model become real Markdown lists.
const prepare = (text: string): string =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/^[ \t]*[•●▪◦·][ \t]+/gm, "- ")
    .replace(/([^\n])\n(?!\n)/g, "$1  \n");

const heading = ({ children }: { children?: React.ReactNode }) => (
  <p className="mb-1.5 mt-5 font-semibold text-zinc-900 first:mt-0">{children}</p>
);

const components: Components = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p: ({ children }) => (
    <p className="my-3 first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-[var(--primary)]/50 first:mt-0 last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-zinc-500 first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--primary)] underline underline-offset-2"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-[var(--primary)]/30 pl-3 text-zinc-600">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.9em]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-4 border-zinc-200" />,
};

type MarkdownTextProps = {
  children: string;
  className?: string;
};

export function MarkdownText({ children, className }: MarkdownTextProps) {
  return (
    <div className={cn("leading-relaxed [overflow-wrap:anywhere]", className)}>
      <Markdown components={components} skipHtml>
        {prepare(children)}
      </Markdown>
    </div>
  );
}
