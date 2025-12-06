"use client";
import { Background } from "@/core/components/ui/background";
import { ProjectLogo } from "@/core/components/ui/logo";
import {
  staggerUpAnimation,
  zoomInAnimation,
} from "@/core/utils/animations/motion";
import { motion } from "motion/react";
import React from "react";
import Link from "next/link";
import { Separator } from "@/core/components/ui/separator";

const Footer = () => {
  const sections: {
    header: string;
    items: {
      text: string;
      link?: string;
    }[];
  }[] = [
      {
        header: "Products",
        items: [
          {
            text: "Solutions",
            link: "/#features",
          },
          {
            text: "Testimonials",
            link: "/#testimonials",
          },
          {
            text: "Pricing",
            link: "/pricing",
          },
          {
            text: "FAQ",
            link: "/#faq",
          },
        ],
      },
      {
        header: "Resources",
        items: [
          {
            text: "Documentations",
            link: "#",
          },
          {
            text: "Contact",
            link: "/contact",
          },
          {
            text: "Carrier",
            link: "#",
          },
          {
            text: "Privacy",
            link: "#",
          },
        ],
      },
      {
        header: "Follow Us",
        items: [
          {
            text: "Twitter",
            link: "#",
          },
          {
            text: "Facebook",
            link: "#",
          },
          {
            text: "Instagram",
            link: "#",
          },
          {
            text: "LinkedIn",
            link: "#",
          },
        ],
      },
    ];

  return (
    <div className="w-full px-12 py-8">
      <Background
        image="/background/footer.svg"
        className="relative z-50 w-full px-6 py-24 h-fit"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="w-full flex flex-row max-md:flex-col items-start">
            <ProjectLogo />
            <motion.div
              initial="hidden"
              animate="show"
              variants={zoomInAnimation}
              className="flex flex-row max-md:flex-wrap w-full gap-4 md:gap-16 justify-end px-24"
            >
              {sections.map((section) => (
                <div key={section.header} className="flex flex-col gap-2 md:gap-6">
                  <motion.p
                    variants={staggerUpAnimation}
                    className="text-lg md:text-2xl font-medium"
                  >
                    {section.header}
                  </motion.p>
                  <div className="flex flex-col gap-3 md:gap-4">
                    {section.items.map((item) => (
                      <Link
                        key={item.text}
                        href={item.link ?? "#"}
                        className="text-sm md:text-base font-normal hover:text-primary transition-all duration-200"
                      >
                        <motion.span variants={staggerUpAnimation}>{item.text}</motion.span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="flex flex-col w-full pt-24">
            <Separator className="mb-4" />
            <p className="text-sm font-normal text-gray-400">
              QuizRx © 2025
            </p>
          </div>
        </div>
      </Background>
    </div>
  );
};

export default Footer;
