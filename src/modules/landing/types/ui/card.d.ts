import { LucideIcon } from "lucide-react";
import { ReactElement } from "react";

export type CardProps = {
  id: number;
  title: string;
  category: string;
  icon: LucideIcon;
  url: string;
};

export type ToggleCardProps = {
  Icon: LucideIcon;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
};

export type FeaturesCardType = {
  title: string;
  description: string;
  icon: React.ElementType;
  image?: ReactElement;
}