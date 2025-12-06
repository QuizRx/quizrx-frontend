"use client";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { zoomInAnimation, zoomUpAnimation } from "@/core/utils/animations/motion";
import { Badge } from "@/core/components/ui/badge";

const Features = () => {
  const { push } = useRouter();
  const features = [
    {
      title: "Intelligent Quiz Engine",
      description:
        "Our AI-powered quiz system dynamically adjusts questions based on user performance, ensuring a personalized experience. It supports multiple-choice, true/false, fill-in-the-blank, and case-based scenarios, making it suitable for various domains, from education to corporate training.",
    },
    {
      title: "Advanced Questionnaire Customization",
      description:
        "Design questionnaires with customizable logic flows, enabling dynamic, response-driven surveys. Ideal for research, patient assessments, and employee evaluations.",
    },
    {
      title: "Instant Feedback & Progress Tracking",
      description:
        "Receive AI-generated explanations for every response, coupled with real-time scoring and in-depth analytics. Users can pinpoint strengths and weaknesses while receiving study recommendations tailored to their needs.",
    },
  ];

  return (
    <motion.div
      id="features"
      initial="hidden"
      animate="show"
      variants={zoomInAnimation}
      className="flex flex-col justify-center px-4 py-10 md:px-10 bg-blue-50 rounded-3xl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <Badge variant="outline" className="w-fit">
          Features
        </Badge>

        <motion.h1
          variants={zoomUpAnimation}
          className="text-3xl md:text-4xl font-medium text-gray-900"
        >
          Smarter Assessments for Everyone
        </motion.h1>

        {/* Cards Layout - Large card on left, two smaller cards on right */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          {/* Large Card - Intelligent Quiz Engine */}
          <Card className="rounded-2xl p-6 w-full lg:w-1/2 relative overflow-hidden">
            <CardHeader className="text-xl font-semibold">
              {features[0].title}
            </CardHeader>
            <CardContent className="flex flex-col h-full gap-6">
              <motion.p variants={zoomUpAnimation} className="text-sm text-muted-foreground">
                {features[0].description}
              </motion.p>
              <div className="">
                <Button className="w-fit" onClick={() => push("/auth/signup")}>
                  Start your Quiz
                </Button>
              </div>
              {/* Grid pattern background */}
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                <div className="grid grid-cols-4 grid-rows-4 gap-1 h-full">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="bg-blue-500 rounded-sm"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Two smaller cards */}
          <div className="flex flex-col gap-4 w-full lg:w-1/2">
            {features.slice(1).map((feature, index) => (
              <Card className="rounded-2xl p-6 w-full" key={index + 1}>
                <CardHeader className="text-xl font-semibold">
                  {feature.title}
                </CardHeader>
                <CardContent className="flex flex-col h-full gap-4">
                  <motion.p variants={zoomUpAnimation} className="text-sm text-muted-foreground">
                    {feature.description}
                  </motion.p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Features;
