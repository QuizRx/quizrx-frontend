"use client";

import { deleteCookie } from "cookies-next";
import { BadgeCheck, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { Separator } from "@/core/components/ui/separator";
import { useSidebar } from "@/core/components/ui/sidebar";
import { useAuth } from "@/core/providers/auth";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    avatar: string;
    email: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { push } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { signOut } = useAuth();

  const userActions = [
    {
      label: "Account",
      icon: BadgeCheck,
      url: "/dashboard/settings",
    },
    {
      label: "Billing",
      icon: CreditCard,
      url: "/dashboard/settings/manage-plan",
    },
    {
      label: "Log out",
      icon: LogOut,
      action: () => setIsDialogOpen(true), // Open the logout confirmation dialog
    },
  ];

  const handleActionClick = (action?: () => void, url?: string) => {
    if (action) {
      action();
    } else if (url) {
      push(url);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsDialogOpen(false);
    deleteCookie("token");
    localStorage.removeItem("subscription-storage");
    signOut();
    setTimeout(() => {
      push("/");
    }, 1000);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Avatar className="h-8 w-8 rounded-lg cursor-pointer">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent
          className="w-fit rounded-lg p-2"
          align="end"
          side={isMobile ? "bottom" : "right"}
          sideOffset={4}
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2 p-2">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs">{user.email}</span>
              </div>
            </div>
            <Separator className="my-1 border-t border-zinc-200" />
            {userActions.map((action, index) => (
              <div
                key={index}
                onClick={() => handleActionClick(action.action, action.url)}
                className="flex items-center gap-2 p-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will be redirected to the
              home page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
