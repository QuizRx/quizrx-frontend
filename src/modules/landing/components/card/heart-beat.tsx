import React from "react";
import { motion } from "motion/react";
import { zoomUpAnimation } from "@/core/utils/animations/motion";

const HeartBeatCard = () => {
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={zoomUpAnimation}
      className="h-40 max-md:h-32 max-md:w-60 justify-center items-center flex flex-col rounded-t-xl rounded-r-none bg-white bottom-0 right-0 w-96 absolute"
    >
      <div className="relative w-full h-20 overflow-hidden">
        <svg
          viewBox="0 0 600 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 0 50 
               L 100 50 
               L 150 50 
               L 200 10 
               L 250 90 
               L 300 10 
               L 350 90 
               L 400 50 
               L 450 50 
               L 600 50"
            fill="none"
            stroke="#317DE6"
            strokeWidth="4"
            initial="hidden"
            animate="visible"
            variants={pathVariants}
            className={"rounded-md"}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default HeartBeatCard;
