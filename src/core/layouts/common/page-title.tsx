import { Separator } from "@/core/components/ui/separator";
import * as React from "react";
import { Button } from "../../components/ui/button";
import { LucideIcon, Plus } from "lucide-react";

export type PageTitleProps = {
  className?: string;
  title?: string;
  description?: string;
  button?: {
    action: () => void;
    text: string;
    icon?: LucideIcon;
  };
  action?: React.ReactNode;
  showSeparator?: boolean;
  backButton?: boolean;
  loading?: boolean;
  error?: string;
};

const PageTitle = ({
  title,
  description,
  className,
  button,
  action,
  showSeparator = true,
}: PageTitleProps) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl mb-2">{title}</h1>
          <p className="text-gray-400 mb-8 text-sm">{description}</p>
        </div>
        {button && (
          <Button onClick={button.action}>
            {button.icon ? (
              <button.icon className="mr-2" />
            ) : (
              <Plus className="mr-2" />
            )}
            {button.text}
          </Button>
        )}
        {action && action}
      </div>
      {showSeparator && <Separator className="mt-5" />}
    </div>
  );
};

export default PageTitle;
