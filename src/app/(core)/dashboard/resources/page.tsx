"use client";

import PageTitle from "@/core/components/shared/page-title";
import { Button } from "@/core/components/ui/button";
import { motion } from "motion/react";

export default function Page() {
  const items = [
    {
      title: "Endocrine Lab Value Ranges",
      detail:
        "Explore how the thyroid gland regulates metabolism and energy levels.",
      image: "/resources/endo.svg",
    },
    {
      title: "Endocrine System",
      detail:
        "Explore how the thyroid gland regulates metabolism and energy levels.",
      image: "/resources/endosys.svg",
    },
    {
      title: "Top Articles and Guidelines",
      detail:
        "Explore how the thyroid gland regulates metabolism and energy levels.",
      image: "/resources/article.svg",
    },
    {
      title: "Managing Diabetes",
      detail:
        "Explore how the thyroid gland regulates metabolism and energy levels.",
      image: "/resources/diabates.svg",
    },
  ];

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
    <div className="mx-auto bg-transparent p-4">
      <PageTitle
        title={"Resources"}
        description={"Cheat sheets, insights & essentials — all in one place"}
      />
      <div className="flex flex-row flex-wrap w-full justify-between gap-6">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-start max-w-72 rounded-2xl w-full justify-between bg-white border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md"
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
                src={item.image}
                className="h-40 w-full object-cover rounded-t-2xl"
                alt={item.title}
              />
            </motion.div>
            <div className="flex flex-col gap-2 px-4 py-3 justify-between">
              <h1 className="font-semibold text-lg">{item.title}</h1>
              <p className="text-sm text-gray-600">{item.detail}</p>

              <Button variant={"outline"}>Learn More</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
