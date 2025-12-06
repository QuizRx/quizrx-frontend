import { ProjectLogo } from "@/core/components/ui/logo";
import Image from "next/image";

const TestimonialCard = ({
  description,
  image,
  name,
  position,
}: {
  description: string;
  image: string;
  name: string;
  position: string;
}) => {
  return (
    <div className="flex flex-col gap-10 items-center justify-center text-center p-10">
      <ProjectLogo includeText textClassName="text-muted-foreground" />
      <p className="text-3xl font-semibold">{description}</p>
      <div className="flex flex-col items-center gap-2">
        <Image src={image} alt="" className="w-12 h-12 rounded-full" />
        <p className="text-xl font-bold">{name}</p>
        <p className="text-sm text-slate-400 font-medium">{position}</p>
      </div>
    </div>
  );
};
export default TestimonialCard;
