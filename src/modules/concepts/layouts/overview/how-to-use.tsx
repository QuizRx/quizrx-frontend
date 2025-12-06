import { useState } from "react";
import ReactPlayer from "react-player";
import { overview } from "../../utils/objects/overview";
import VideoCard from "../../components/cards/video";
import { Dialog, DialogContent } from "@/core/components/ui/dialog";

const HowToUse = () => {
  const [open, setOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");

  const handleCardClick = (url: string) => {
    setSelectedVideo(url);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-1 mt-10">
      <h1 className="text-xl font-semibold">Learn how to use</h1>
      <p className="text-muted-foreground">
        Here are some helpful resources to get you started with concepts.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-between mt-6">
        {overview.map((card) => (
          <VideoCard
            key={card.id}
            card={card}
            handleCardClick={handleCardClick}
          />
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[100vw] max-w-[1400px] h-[100vh]">
          <ReactPlayer
            url={selectedVideo}
            width="100%"
            height="100%"
            controls
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HowToUse;
