import { LucideIcon } from "lucide-react";

const CustomerCard = ({
  Icon,
  title,
  description,
  detail,
}: {
  Icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
}) => {
  return (
    <div className="flex flex-col gap-4 items-start p-6 rounded-lg bg-neutral-100 w-72 h-60 justify-between">
      <div className="p-3 rounded-md bg-primary">
        <Icon color="white" size={24} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-bold">{title}</p>
        <p className="text-neutral-600">{description}</p>
      </div>
      <p className="text-primary font-light italic">{detail}</p>
    </div>
  );
};

export default CustomerCard;
