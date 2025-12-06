"use client";
import { ArrowRight, Menu } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button";
import { ProjectLogo } from "@/core/components/ui/logo";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/core/components/ui/menubar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/core/components/ui/sheet";
import { staggerUpAnimation } from "@/core/utils/animations/motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

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

  const navItems: {
    name: string;
    href?: string;
    subMenus?: {
      name: string;
      href: string;
    }[];
  }[] = [
      {
        name: "Home",
        href: "/",
      },
      {
        name: "About Us",
        href: "/about-us",
      },
      {
        name: "Pricing",
        href: "/pricing",
      },
      {
        name: "Get in touch",
        href: "/contact",
      },
    ];

  return (
    <div className="fixed top-10 right-0 left-0 w-full px-12 z-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`mx-8 px-8 w-full mx-auto self-center z-40 rounded-2xl transition-all ${isScrolled
          ? "bg-[#D3DAE2]/20 backdrop-blur-xl border border-background"
          : "bg-transparent"
          }`}
      >
        <div className={`mx-auto flex py-4 w-full items-center justify-between`}>
          <Link href="/" className="flex items-center text-xl font-bold">
            <ProjectLogo size={30} />
          </Link>
          {/**@ts-ignore */}
          <Menubar className="w-fit mx-auto max-lg:hidden ">
            {navItems.map((item) => (
              <MenubarMenu key={item.name}>
                {/**@ts-ignore */}
                <MenubarTrigger hasChildren={item.subMenus ? true : false}>
                  {item.subMenus ? (
                    item.name
                  ) : (
                    <motion.div variants={staggerUpAnimation}>
                      <Link href={item.href || ""}>
                        {item.name}
                      </Link>
                    </motion.div>
                  )}
                </MenubarTrigger>
                {item.subMenus && (
                  <>
                    {/**@ts-ignore */}
                    <MenubarContent className={`bg-background`}>
                      {item.subMenus.map((subMenu) => (
                        <>
                          {/**@ts-ignore */}
                          <MenubarItem key={subMenu.name}>
                            <Link
                              href={subMenu.href}
                              className={
                                pathname === subMenu.href ? "text-primary" : ""
                              }
                            >
                              {subMenu.name}
                            </Link>
                          </MenubarItem>
                        </>
                      ))}
                    </MenubarContent>
                  </>
                )}
              </MenubarMenu>
            ))}
          </Menubar>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
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
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
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
                  {navItems.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href || ""}
                        className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${pathname === item.href ? "text-primary" : ""
                          }`}
                      >
                        {item.name}
                      </Link>
                      {item.subMenus && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.subMenus.map((subMenu) => (
                            <Link
                              key={subMenu.name}
                              href={subMenu.href}
                              className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors block ${pathname === subMenu.href ? "text-primary" : ""
                                }`}
                            >
                              {subMenu.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex flex-col gap-4 mt-4 md:hidden">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button variant="default" asChild className="w-full">
                      <Link href="/auth/signup">
                        Start a Free Trial <ArrowRight className="ml-2 h-4 w-4" />
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
