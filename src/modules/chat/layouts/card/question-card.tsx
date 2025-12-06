// src/components/QuestionCard.jsx
"use client";

import { motion } from "motion/react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Question } from "../../types/api/question";
import { QuestionBank } from "../../types/api/question-bank";

export default function QuestionCard({
  item,
  index,
}: {
  item: QuestionBank;
  index: number;
}) {
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
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      key={index}
      className="flex flex-col items-start max-w-96 rounded-2xl w-full justify-between bg-white border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      transition={{ staggerChildren: 0.1 }}
    >
      <motion.div
        className="relative w-full h-40 overflow-hidden"
        variants={imageVariants}
      >
        <img
          src={"/questions/neuro.svg"}
          className="h-40 w-full object-cover rounded-t-2xl"
          alt={item.name}
        />
        <motion.h1
          className="font-light absolute top-20 left-20 text-2xl text-white drop-shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {item.name}
        </motion.h1>
      </motion.div>

      <div className="flex flex-col gap-2 px-4 py-3 justify-between w-full">
        <div className="flex flex-row justify-between w-full">
          <h1 className="font-semibold text-lg">{item.name}</h1>
        </div>
        <p className="text-sm text-gray-600">{item.name}</p>
        <Button variant={"outline"} className="w-full">Explore</Button>
      </div>
    </motion.div>
  );
}
