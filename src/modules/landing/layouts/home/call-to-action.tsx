"use client";
import { Background } from "@/core/components/ui/background";
import { Button } from "@/core/components/ui/button";
import { zoomInAnimation, zoomUpAnimation } from "@/core/utils/animations/motion";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import HeartBeatCard from "../../components/card/heart-beat";

const CallToAction = () => {
  const { push } = useRouter();
  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={zoomInAnimation}
      className="relative z-0"
    >
      <Background
        image="/background/dna.svg"
        className="w-full flex flex-col items-start justify-start p-4 sm:p-6 md:p-8 lg:p-16"
      >
        <div className="w-full lg:w-3/4 flex flex-col z-50 gap-3 sm:gap-4 md:gap-5 self-start">
          <motion.h1
            className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-medium leading-snug"
            variants={zoomUpAnimation}
          >
            Unlock Knowledge with Smart Quizzes & In-Depth Questionnaires
          </motion.h1>
          <motion.p
            variants={zoomUpAnimation}
            className="text-lg font-normal w-full md:w-3/4 lg:w-1/2 leading-relaxed mb-8"
          >
            Engage with expertly crafted quizzes designed for professionals,
            students, and enthusiasts.
          </motion.p>
          <Button
            variant={"outline"}
            onClick={() => push("/auth/signup")}
            className="w-full sm:w-fit px-12 py-6 rounded-xl"
          >
            Get Started
          </Button>
        </div>
        <HeartBeatCard />
      </Background>
    </motion.main>
  );
};

export default CallToAction;
