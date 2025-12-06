"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardFooter } from "@/core/components/ui/card";
import { zoomUpAnimation } from "@/core/utils/animations/motion";
import { useRouter } from "next/navigation";
import useChapterSelection from "../hooks/use-chapter-selection";

const AvatarCard = ({
  avatar,
}: {
  avatar: {
    image: string;
    name: string;
    looks: string;
    specialty: string;
    knowledgeId: string;
  };
}) => {
  const { push } = useRouter();
  const { selectChapter, selectedChapter } = useChapterSelection();

  const handleClick = () => {
    console.log("=== Avatar Selection Debug ===");
    console.log("Avatar object:", avatar);
    console.log("Avatar name:", avatar.name);
    console.log("Avatar specialty:", avatar.specialty);
    console.log("Avatar knowledgeId:", avatar.knowledgeId);
    console.log("Current selected chapter:", selectedChapter);
    
    // Validate knowledgeId exists
    if (!avatar.knowledgeId) {
      console.warn("Warning: knowledgeId is missing or empty!");
      console.log("knowledgeId type:", typeof avatar.knowledgeId);
      console.log("knowledgeId value:", avatar.knowledgeId);
    }

    // Call selectChapter with both parameters
    console.log("Calling selectChapter with:", avatar.specialty, avatar.knowledgeId);
    selectChapter(avatar.specialty, avatar.knowledgeId);
    
    console.log("Navigating to:", `/dashboard/avatars/${avatar.name.toLowerCase().replace(/\s+/g, "-")}`);
    console.log("=== End Debug ===");
    
    push(`/dashboard/avatars/${avatar.name.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial="hidden"
      animate="show"
      variants={zoomUpAnimation}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full hover:cursor-pointer"
    >
      <Card className="overflow-hidden bg-white border-4 sm:border-8 border-white rounded-3xl sm:rounded-4xl flex flex-col gap-2 h-full">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl">
            <img
              src={avatar.image || "/placeholder.svg"}
              alt={avatar.name}
              className="object-cover size-full rounded-2xl sm:rounded-3xl"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center p-3 sm:p-4 bg-primary/5 rounded-2xl sm:rounded-3xl">
          <h3 className="font-medium text-lg sm:text-xl">{avatar.name}</h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            {avatar.looks}
          </p>
          
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AvatarCard;