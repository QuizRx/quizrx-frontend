"use client";
import { ArrowRight, Menu } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { ProjectLogo } from "@/core/components/ui/logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/core/components/ui/sheet";
import { useVisibleNavItems } from "@/modules/cms/hooks/use-cms";
import { useAuth } from "@/core/providers/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data, loading } = useVisibleNavItems();
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is admin
  const isAdmin = isAuthenticated && user?.email === 'admin@quizrx.ai';
  
  // Static navigation items that are always available
  const staticNavItems = [
    { _id: 'home', name: 'Home', href: '/', order: 0 },
    { _id: 'about', name: 'About Us', href: '/about-us', order: 1 },
    { _id: 'pricing', name: 'Pricing', href: '/pricing', order: 2 },
    { _id: 'contact', name: 'Get in touch', href: '/contact', order: 3 },
  ];
  
  // Get CMS items and place them after static items
  const cmsNavItems = data?.getVisibleNavItems || [];
  const sortedCmsNavItems = [...cmsNavItems].sort((a, b) => a.order - b.order);
  const allNavItems = [...staticNavItems, ...sortedCmsNavItems];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-10 right-0 left-0 w-full px-12 z-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`mx-auto px-8 w-full max-w-7xl self-center z-40 rounded-2xl transition-all ${
          isScrolled
            ? "bg-[#D3DAE2]/20 backdrop-blur-xl border border-background"
            : "bg-transparent"
        }`}
      >
        <div
          className={`flex py-4 w-full items-center justify-between gap-4`}
        >
          <Link href="/" className="flex items-center text-xl font-bold shrink-0">
            <ProjectLogo size={30} />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-4 flex-wrap justify-center flex-1">
            {allNavItems.map((item) => (
              <Link
                key={item._id}
                href={item.href || ""}
                className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  pathname === item.href ? "text-primary" : "text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-4">
              {isAdmin && (
                <Button variant="outline" asChild>
                  <Link href="/cms-dashboard">Dashboard</Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/auth/login">SignIn</Link>
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full lg:hidden"
                >
                  <Menu className="h-5 w-5 md:h-10 md:w-10 text-muted-foreground" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              {/**@ts-ignore */}
              <SheetContent side="right" className="w-75 sm:w-96">
                <SheetHeader>
                  <SheetTitle></SheetTitle>
                </SheetHeader>
                <nav className="grid gap-6 p-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <ProjectLogo />
                  </Link>
                  {allNavItems.map((item) => (
                    <Link
                      key={item._id}
                      href={item.href || ""}
                      className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${
                        pathname === item.href ? "text-primary" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-4 mt-4 md:hidden">
                    {isAdmin && (
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/cms-dashboard">Dashboard</Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button variant="default" asChild className="w-full">
                      <Link href="/auth/signup">
                        Start a Free Trial{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </div>
  );
}
