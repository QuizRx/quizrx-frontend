import { Card, CardContent } from "@/core/components/ui/card";
import { CardProps } from "@/core/types/ui/card";
import { Play } from "lucide-react";

const VideoCard = ({
  card,
  handleCardClick,
}: {
  card: CardProps;
  handleCardClick: (url: string) => void;
}) => {
  return (
    <Card>
      <CardContent
        className="flex flex-row gap-4 p-6 cursor-pointer min-w-72 w-full hover:translate-y-1 transition-all ease-linear duration-200"
        onClick={() => handleCardClick(card.url)}
      >
        <card.icon className="w-8 h-8 mb-2 text-primary" />
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{card.title}</h2>
          <p className="text-xs text-gray-500">{card.category}</p>
          <div className="flex flex-row gap-2 items-center">
            <Play className="w-4 h-4 text-gray-500" fill="gray" /> 2:00
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
