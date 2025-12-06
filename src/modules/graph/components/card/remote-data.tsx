import { Card } from "@/core/components/ui/card";
import { Circle } from "lucide-react";
import Image from "next/image";

const RemoteDataCard = ({
  img,
  name,
  isSelected,
  onClick,
}: {
  img: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all ease-linear duration-200 flex flex-row gap-2 items-center py-4 pr-10 max-md:w-full   pl-4 min-w-fit ${
        isSelected && "border border-purple-500 bg-primary/5 backdrop-blur-md"
      }`}
      onClick={onClick}
    >
      <Circle
        size={20}
        className="text-zinc-400  transition-all ease-linear duration-200"
        fill={isSelected ? "#a855f7" : "white"}
      />
      <Image src={img} alt={name} className="w-6 h-6" />
      <p>{name}</p>
    </Card>
  );
};

export default RemoteDataCard;
