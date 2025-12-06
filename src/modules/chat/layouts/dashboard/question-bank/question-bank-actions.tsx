import { Dice5, FileSearch, LayoutGrid } from "lucide-react";
import { motion } from "motion/react";
import { CardTitle } from "@/core/components/ui/card";

import { useToast } from "@/core/hooks/use-toast";

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

export default function QuestionBankActions({
  questions,
  setIsCreateOpen,
  selectedTopics,
  setQuizType,
  setSelectedQuestionBanks,
}: any) {
  const { toast } = useToast();

  const selectedQuestionBanks = questions.filter((q: formattedQuestions) =>
    selectedTopics?.includes(q.name)
  );

  const totalQuestions = selectedQuestionBanks.reduce(
    (acc: number, questionBank: formattedQuestions) =>
      acc + questionBank.totalQuestions,
    0
  );

  const handleCardClick = async (card: CardType) => {
    const totalQuestionsSum = questions.reduce((sum: number, item: any) => {
      return sum + (item.totalQuestions || 0);
    }, 0);

    if (card.title == "Create Automated Quiz") {
      if (totalQuestionsSum < 5) {
        toast({
          variant: "destructive",
          title: "Insufficient Questions",
          description:
            "Please add at least 5 questions to the question bank before generating a quiz.",
        });
        return;
      }

      setQuizType("automated");
      setIsCreateOpen(true);
    }

    if (card.title == "Quiz From Selection") {
      if (totalQuestions < 5) {
        toast({
          variant: "destructive",
          title: "Insufficient Questions",
          description:
            "Please select topics that has at least 5 questions in total before generating a quiz.",
        });
        return;
      }
      setQuizType("selected");
      setSelectedQuestionBanks(selectedQuestionBanks);
      setIsCreateOpen(true);
    }

    if (card.title == "Create Mock Exam") {
      if (totalQuestionsSum < 50) {
        toast({
          variant: "destructive",
          title: "Insufficient Questions",
          description:
            "Please add at least 50 questions to the question bank before generating a mock exam.",
        });
        return;
      }
      setQuizType("mock");
      setIsCreateOpen(true);
    }
  };

  const cardData: CardType[] = [
    {
      icon: Dice5,
      title: "Create Automated Quiz",
      description: "Start a automated quiz from all Endocrinology subtopics",
      prompt: "Start a automated quiz from all Endocrinology subtopics",
    },
    {
      icon: LayoutGrid,
      title: "Quiz From Selection",
      description: "Select questions from the table below and start a quiz",
      prompt: "TBD",
    },
    {
      icon: FileSearch,
      title: "Create Mock Exam",
      description: "Simulate a full-length mock exam from this subject",
      prompt: "Simulate a full-length mock exam from this subject",
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
