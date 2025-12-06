"use client";

import { motion } from "motion/react";
import AvatarCard from "../../components/avatar-card";
import {
  staggerUpAnimation,
  zoomInAnimation,
} from "@/core/utils/animations/motion";

const AvatarGrid = ({
  avatars,
}: {
  avatars: any;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={zoomInAnimation}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {avatars.map((avatar:any, index:any) => (
        <motion.div key={avatar.id} variants={staggerUpAnimation}>
          <AvatarCard avatar={avatar} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AvatarGrid;
