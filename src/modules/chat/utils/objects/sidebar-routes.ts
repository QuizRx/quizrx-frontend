import {
  BookDashed,
  MessageSquare as Chat,
  Notebook,
  Package as Products,
  SatelliteIcon,
  Settings,
  HelpCircle,
  User,
  User2,
  Book,
  School,
  PaintBucket,
  FileQuestion,
  StickyNote,
  TextSelection,
  Text,
  ChartBar,
  LucideFileQuestion,
} from "lucide-react";

import { SidebarGroups } from "@/core/types/ui/sidebar";
import { QuestionMarkIcon } from "@radix-ui/react-icons";

const baseRoute = "/dashboard";

const getSidebarRoutes = (routeName: string): SidebarGroups => {
  return [
    {
      title: "Chat",
      url: baseRoute,
      icon: Chat,
      isActive: routeName === baseRoute,
    },
    {
      title: "Avatars",
      url: `${baseRoute}/avatars`,
      icon: User2,
      isActive: routeName === `${baseRoute}/avatars`,
    },
    
    {
      title: "Question History",
      url: `${baseRoute}/question-history`,
      icon: LucideFileQuestion,
      isActive: routeName === `${baseRoute}/question-history`,
    },
    {
      title: "Question Bank",
      url: `${baseRoute}/question-bank`,
      icon: TextSelection,
      isActive: routeName === `${baseRoute}/question-bank`,
    },
    {
      title: "Quiz History",
      url: `${baseRoute}/quiz-history`,
      icon: Text,
      isActive: routeName === `${baseRoute}/quiz-history`,
    },
    {
      title: "Mock Exams",
      url: `${baseRoute}/mock-exams`,
      icon: Book,
      isActive: routeName === `${baseRoute}/mock-exams`,
    },
    {
      title: "Curriculum",
      url: `${baseRoute}/curriculum`,
      icon: School,
      isActive: routeName === `${baseRoute}/curriculum`,
    },
    {
      title: "Performance Insights",
      url: `${baseRoute}/performance-insights`,
      icon: ChartBar,
      isActive: routeName === `${baseRoute}/performance-insights`,
    },
    {
      title: "Settings & Help",
      url: `${baseRoute}/settings`,
      icon: Settings,
      isActive:
        routeName.includes(`${baseRoute}/settings`) ||
        routeName.includes(`${baseRoute}/help`),
      items: [
        {
          title: "Account Settings",
          url: `${baseRoute}/settings`,
          icon: Settings,
          isActive: routeName === `${baseRoute}/settings`,
        },
        {
          title: "Help & Support",
          url: `${baseRoute}/help`,
          icon: HelpCircle,
          isActive: routeName === `${baseRoute}/help`,
        },
      ],
    },
  ];
};

export { getSidebarRoutes };
