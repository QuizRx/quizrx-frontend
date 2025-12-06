"use client";
import { ToggleCardProps } from "../../types/ui/card";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/core/components/ui/card";
import { Circle } from "lucide-react";

const ToggleCard = ({
  Icon,
  title,
  description,
  isSelected,
  onClick,
}: ToggleCardProps) => {
  return (
    <Card
      className={`p-4 max-w-96 max-md:p-2  relative cursor-pointer transition-all ease-linear duration-200 ${
        isSelected && "border border-purple-500 bg-primary/5 backdrop-blur-md"
      }`}
      onClick={onClick}
    >
      <CardContent className="flex flex-col gap-4 items-start justify-between ">
        <Circle
          className="text-zinc-400 absolute top-6 right-6 transition-all ease-linear duration-200"
          fill={isSelected ? "#a855f7" : "white"}
        />
        <Icon
          className={`h-10 w-10 p-2 border rounded transition-all ease-linear duration-200 ${
            isSelected
              ? "border-primary text-primary"
              : "border-gray-200 text-zinc-400"
          }`}
        />
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription
          className={`text-sm max-md:text-xs transition-all ease-linear duration-200 p-0 ${
            isSelected ? "text-primary" : "text-zinc-400"
          }`}
        >
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default ToggleCard;
