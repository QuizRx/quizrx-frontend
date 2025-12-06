import { Bell } from "lucide-react";
import React from "react";
import { Button } from "@/core/components/ui/button";
import {
  useNotificationSidebar,
} from "@/core/providers/notification-sidebar-provider";


export const NotificationIndicator = () => {
  const { openSidebar} = useNotificationSidebar();
  
  const handleClick = () => {
    openSidebar()
  }

  return (
    <div className="relative">
      <Button variant={"outline"} onClick={handleClick}>
        <div className=" absolute top-0 z-50 right-0  bg-red-600 rounded-full flex flex-col items-center justify-center">
          <div className="h-2.5 w-2.5 bg-red-700 animate-ping rounded-full" />
        </div>
        <Bell className="w-6 h-6 animate-bell" />
      </Button>
    </div>
  );
};
