import { Button } from "@/core/components/ui/button";
import {
  Dice5,
  Dices,
  FileSearch,
  LayoutGrid,
  ChevronDown,
  Calendar,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";
import { CardTitle } from "@/core/components/ui/card";
import { GENERATE_QUIZ } from "@/modules/chat/apollo/mutation/quiz";
import { useMutation } from "@apollo/client";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/core/hooks/use-toast";
import { useChat } from "../../../store/chat-store";

type CardType = {
  icon: React.ElementType;
  title: string;
  description: string;
  prompt?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

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

interface formattedQuestions {
  name: string;
  description: string;
  masteryLevel: string;
  totalQuestions: number;
}

export default function MockExamActions({ questions }: any) {
  const [generateQuiz] = useMutation(GENERATE_QUIZ);
  const { toast } = useToast();
  const router = useRouter();

  const { loadThread } = useChat();

  const handleCardClick = async (card: CardType) => {
    let thread;
    if (card.title == "Curated by QuizRX") {
      const totalQuestionsSum = questions.reduce((sum: number, item: any) => {
        return sum + (item.totalQuestions || 0);
      }, 0);

      if (totalQuestionsSum < 5) {
        toast({
          variant: "destructive",
          title: "Insufficient Questions",
          description:
            "Please add at least 5 questions to the question bank before generating a quiz.",
        });
        return;
      }

      thread = await generateQuiz();
    }

    if (card.title == "Auto Generated") {
      // handle subtopic selection
      //     if (totalQuestionsSum < 5) {
      toast({
        variant: "destructive",
        title: "Insufficient Questions",
        description:
          "Please add at least 5 questions to this subtopic before generating a quiz.",
      });
      return;
      // }
    }

    router.push("/dashboard");
    if (thread?.data) {
      loadThread(thread.data.generateQuiz._id);
    }
  };

  const cardData: CardType[] = [
    {
      icon: Dice5,
      title: "Curated by QuizRX",
      description: "Start a automated quiz from all Endocrinology subtopics",
      prompt: "Start a automated quiz from all Endocrinology subtopics",
    },
    {
      icon: LayoutGrid,
      title: "Auto Generated",
      description: "Select questions from the table below and start a quiz",
      prompt: "TBD",
    },
  ];

  return (
    <div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3  w-full max-w-3xl my-6 mx-auto"
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
                      shadow-none border p-4 border-zinc-200 rounded-lg h-full space-y-3
                    cursor-pointer group bg-card hover:bg-gradient-to-br hover:from-primary/80 hover:to-primary hover:text-white`}
              onClick={() => handleCardClick(card)}
            >
              <card.icon className="h-5 w-5" />
              <CardTitle className="text-base md:text-lg">
                {card.title}
              </CardTitle>
              <div>
                <p
                  className={`text-xs text-muted-foreground group-hover:text-primary-foreground`}
                >
                  {card.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
      </motion.div>
    </div>
  );
}
