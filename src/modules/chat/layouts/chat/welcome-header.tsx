"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { ProjectLogo } from "@/core/components/ui/logo";
import { useAuth } from "@/core/providers/auth";
import {
  Calendar,
  FileText,
  LayoutGrid,
  MessageCircleQuestion,
} from "lucide-react";
import { useChat } from "../../store/chat-store";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { motion } from "motion/react";
import FormTopics from "./form-topics";
// Type definition for welcome cards
type CardType = {
  icon: React.ElementType;
  title: string;
  description: string;
  isPrimary: boolean;
  prompt?: string;
  action?: () => void;
};

export const WelcomeHeader = () => {
  const { user } = useAuth();
  const { handleSubmit } = useChat();
  const [openQuiz, setOpenQuiz] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Card data mapping for welcome layout
  const cardData: CardType[] = [
    {
      icon: FileText,
      title: "Create",
      description: "Curated questions based on your performance.",
      isPrimary: true,
      prompt: "Show me a recommended question based on my performance",
    },
    {
      icon: LayoutGrid,
      title: "Todays Challenge",
      description: "A hand-picked question to test your knolwedge.",
      isPrimary: false,
      prompt: "What's today's Endocrinology challenge question?",
    },
    {
      icon: MessageCircleQuestion,
      title: "Quiz from Selection",
      description: "Select a topic and a subtopic to have a personalized quiz.",
      isPrimary: false,
      action: () => {
        setOpenQuiz(true);
      },
    },
  ];

  // Preset prompt buttons
  const presetPrompts = [
    "Help me prepare for an upcoming test",
    "Explain a difficult concept to me",
    "Generate practice questions on a topic",
    "Analyze my weak areas",
  ];

  const handleCardClick = (card: CardType) => {
    if (card.prompt) {
      handleSubmit(card.prompt);
    }
    if (card.action) {
      card.action();
    }
  };

  const handlePresetPromptClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  // Container animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Header animations
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.97,
      transition: { duration: 0.1 },
    },
  };

  // Badge animations
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.9,
      transition: { duration: 0.1 },
    },
  };

  return (
    <>
      {!openQuiz && (
        <motion.div
          className="flex flex-col items-center w-full gap-3 sm:gap-4 md:gap-6 lg:gap-8 py-3 sm:py-4 px-3 sm:px-4 md:px-6 lg:px-8 3xl:mt-40"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Welcome section */}
          <div className="text-center max-w-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4">
            <img src="/logo/light-log.svg" className="w-7 sm:w-8 h-7 sm:h-8" />
            <h2 className="text-base sm:text-lg md:text-xl text-zinc-400 font-medium">
              Hi, {user?.name.split(" ")[0]}
            </h2>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-primary px-2">
              How Can I Help You Today?
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-xs sm:text-sm px-2">
              Let's dive into today&apos;s quiz journey. Whether you're here to
              practice or challenge yourself, we&apos;ve got your back.
            </p>
          </div>

          {/* Information cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 w-full max-w-3xl mt-4 sm:mt-6 min-w-0"
            variants={containerVariants}
          >
            {cardData.map((card, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <div
                  className={`
                shadow-none border p-3 sm:p-4 border-zinc-200 rounded-lg h-full
                ${
                  card.isPrimary
                    ? "bg-gradient-to-br from-primary/80 to-primary text-white"
                    : "bg-card hover:bg-gradient-to-br hover:from-primary/80 hover:to-primary hover:text-white"
                } cursor-pointer group`}
                  onClick={() => handleCardClick(card)}
                >
                  <card.icon className="h-5 w-5 mb-2" />
                  <CardTitle className="text-sm sm:text-base md:text-lg mb-1">
                    {card.title}
                  </CardTitle>
                  <div>
                    <p
                      className={`text-xs leading-relaxed ${
                        card.isPrimary
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary-foreground"
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
      {openQuiz && (
        <motion.div
          className="flex flex-col items-center w-full gap-3 sm:gap-4 md:gap-6 lg:gap-8 py-3 sm:py-4 px-3 sm:px-4 md:px-6 lg:px-8 3xl:mt-40"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Button
            className="self-start mb-2 px-2 sm:px-3 py-1 text-sm transition"
            onClick={() => setOpenQuiz(false)}
          >
            ← Back
          </Button>

          <FormTopics />
        </motion.div>
      )}
    </>
  );
};
