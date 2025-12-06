"use client"
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { staggerUpAnimation, zoomInAnimation, zoomUpAnimation } from "@/core/utils/animations/motion";


const HowItWorks = () => {
  const { push } = useRouter();
  const works = [
    {
      tabTitle: "Select or Create",
      fullTitle: "Select or Create a Quiz",
      content: {
        image: "/images/quiz.png",
        title: "Select or Create a Quiz",
        list: [
          "Browse our extensive library of pre-made quizzes, or build your own from scratch.",
          "Customize the structure, question types, and difficulty levels to fit your needs.",
          "Use AI-assisted question generation to create high-quality quizzes effortlessly.",
        ],
      },
    },
    {
      tabTitle: "Engage",
      fullTitle: "Engage with Interactive Questions",
      content: {
        image: "/images/quiz.png",
        title: "Engage with Interactive Questions",
        list: [
          "Experience dynamic question formats that adapt to user responses.",
          "Real-time feedback keeps participants engaged throughout the quiz.",
          "Interactive elements make assessments feel like a conversation.",
        ],
      },
    },
    {
      tabTitle: "Get Insights",
      fullTitle: "Receive Instant Results & Insights",
      content: {
        image: "/images/quiz.png",
        title: "Receive Instant Results & Insights",
        list: [
          "Get comprehensive analytics immediately after quiz completion.",
          "View performance breakdowns by question or participant.",
          "Export results for further analysis or reporting.",
        ],
      },
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={zoomInAnimation}
      className="flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 bg-blue-50 rounded-xl sm:rounded-2xl lg:rounded-3xl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-6 w-full">
        <Badge variant={"outline"} className="w-fit">
          How it works
        </Badge>

        <motion.h1
          variants={zoomUpAnimation}
          className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900"
        >
          Understanding the Process
        </motion.h1>
        <motion.p 
          variants={zoomUpAnimation}
          className="text-sm sm:text-base text-muted-foreground text-center max-w-4xl mx-auto"
        >
          QuizRX is designed to make assessments engaging, intelligent, and
          insightful. Our platform uses AI-powered automation to create
          interactive quizzes and surveys, helping users get real-time feedback
          and detailed analytics.
        </motion.p>

        <Tabs defaultValue={works[0]?.tabTitle} className="w-full">
          <TabsList className="flex flex-row flex-wrap gap-2 items-start justify-start w-full">
            {works.map((work, index) => (
              <TabsTrigger
                variant={"roundedTop"}
                value={work.tabTitle}
                key={index}
                className="text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">{work.fullTitle}</span>
                <span className="sm:hidden">{work.tabTitle}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {works.map((work, index) => (
            <TabsContent
              value={work.tabTitle}
              key={index}
              className="bg-background h-auto sm:h-96 rounded-xl sm:rounded-2xl lg:rounded-3xl rounded-tl-none mt-2"
            >
              <div className="flex flex-col sm:flex-row justify-between w-full h-full">
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 md:p-8 w-full">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
                    {work.content.title}
                  </h1>
                  <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                    {work.content.list.map((li, i) => (
                      <motion.div
                        key={i}
                        className="flex flex-row gap-2 items-start text-xs sm:text-sm leading-snug"
                      >
                        <span className="border-primary border rounded-full h-fit w-fit flex flex-col items-center justify-center mt-0.5">
                          <span className="bg-primary p-1 sm:p-1.5 m-0.5 sm:m-1 rounded-full"></span>
                        </span>
                        {li}
                      </motion.div>
                    ))}
                    <Button  onClick={() => push("/auth/signup")} className="w-fit mt-2 sm:mt-4">
                      Get Started
                    </Button>
                  </div>
                </div>
                <motion.img
                  variants={staggerUpAnimation}
                  src={work.content.image}
                  alt={work.content.title}
                  className="w-full sm:w-1/2 h-48 sm:h-auto object-cover sm:object-contain border-t sm:border-t-0 sm:border-l border-border/50"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.div>
  );
};

export default HowItWorks;