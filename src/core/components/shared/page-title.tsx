import { Separator } from "@/core/components/ui/separator";
import * as React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export type PageTitleProps = {
  className?: string;
  title: string;
  description: string;
  action?: () => void;
  buttonTitle?: string;
};

const PageTitle = ({
  title,
  description,
  className,
  action,
  buttonTitle,
}: PageTitleProps) => {
  return (
    <div className={`w-full my-4 ${className}`}>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl mb-2">{title}</h1>
          <p className="text-gray-400 mb-8 text-sm">{description}</p>
        </div>
        {action && (
          <Button onClick={action}>
            <Plus className="mr-2" />
            {buttonTitle}
          </Button>
        )}
      </div>
      <Separator className="mt-2" />
    </div>
  );
};

export default PageTitle;
