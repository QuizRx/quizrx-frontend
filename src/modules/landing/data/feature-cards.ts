import { Brain, MessageSquareHeart, Target, type LucideIcon } from "lucide-react";

export type FeatureCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

// Approved beta feature cards (spec A-03). Reused on the landing page and the
// About page (A-04). Copy is fixed and must match the approved wording.
export const FEATURE_CARDS: readonly FeatureCard[] = [
  {
    icon: Target,
    title: "Focused Learning",
    description:
      "Explore 9 high-yield Calcium & Bone topics designed to strengthen your clinical thinking through carefully structured questions and explanations.",
  },
  {
    icon: Brain,
    title: "Two Ways to Learn",
    description:
      "Reinforce essential knowledge with short-answer practice in Practice Studio, then apply it through curated clinical reasoning questions in QuizRx Reasoning.",
  },
  {
    icon: MessageSquareHeart,
    title: "Help Shape QuizRx",
    description:
      "Your insights will directly influence future modules, features, and the overall QuizRx learning experience.",
  },
] as const;
