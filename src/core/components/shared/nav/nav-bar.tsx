"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { ProjectLogo } from "@/core/components/ui/logo";
import { NavUser } from "@/core/layouts/dashboard/nav/user";
import { useAuth } from "@/core/providers/auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/core/components/ui/sheet";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Feedback", href: "/feedback" },
  { label: "Privacy", href: "/privacy-policy" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-6 inset-x-0 z-50 w-full px-4 md:px-12">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-6 py-3 transition-all ${
          isScrolled
            ? "border border-zinc-200/60 bg-white/70 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <ProjectLogo size={28} />
          <span className="text-base font-semibold text-[var(--primary)]">
            QuizRx
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                pathname === item.href
                  ? "text-[var(--primary)]"
                  : "text-zinc-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 text-xs font-semibold text-[var(--primary)] md:inline-flex">
            Beta
          </span>
          {isAuthenticated ? (
            <>
              <Button
                asChild
                className="hidden rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 md:inline-flex"
              >
                <Link href="/chat">Open chat</Link>
              </Button>
              <NavUser
                user={{
                  name: user?.name || "",
                  avatar: user?.picture || "",
                  email: user?.email || "",
                }}
              />
            </>
          ) : (
            <Button
              asChild
              className="hidden rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 md:inline-flex"
            >
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-[var(--primary)]">
                  QuizRx Beta
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-base font-medium text-zinc-700 hover:text-[var(--primary)]"
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <Button
                    asChild
                    className="mt-4 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                  >
                    <Link href="/chat">Open chat</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="mt-4 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                  >
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </motion.header>
    </div>
  );
}
