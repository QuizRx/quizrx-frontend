"use client";

import Link from "next/link";
import { ProjectLogo } from "@/core/components/ui/logo";
import { Separator } from "@/core/components/ui/separator";

const FOOTER_LINKS = [
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Cookies", href: "/cookies-policy" },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-zinc-200/60 bg-white/40 px-6 py-10 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <ProjectLogo size={28} />
          <div>
            <p className="text-sm font-semibold text-[var(--primary)]">
              QuizRx
            </p>
            <p className="text-xs text-zinc-500">Closed beta - Calcium &amp; Bone</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-[var(--primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <Separator className="my-6" />
      <p className="text-center text-xs text-zinc-500">
        QuizRx (c) 2026 - Closed Beta
      </p>
    </footer>
  );
};

export default Footer;
