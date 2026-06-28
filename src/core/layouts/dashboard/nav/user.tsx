"use client";

import { deleteCookie } from "cookies-next";
import {
  Home,
  Info,
  LogOut,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
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
import { useIsMobile } from "@/core/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const { push } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { signOut } = useAuth();

  const userActions = [
    {
      label: "Open chat",
      icon: MessageSquare,
      url: "/chat",
    },
    {
      label: "Home",
      icon: Home,
      url: "/",
    },
    {
      label: "About",
      icon: Info,
      url: "/about-us",
    },
    {
      label: "Contact",
      icon: Mail,
      url: "/contact",
    },
    {
      label: "Privacy notice",
      icon: ShieldCheck,
      url: "/privacy-policy",
    },
    {
      label: "Log out",
      icon: LogOut,
      action: () => setIsDialogOpen(true),
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

  const initial = user.name?.[0] ?? user.email?.[0] ?? "?";

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Avatar className="h-8 w-8 rounded-full cursor-pointer">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full">{initial}</AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 rounded-lg p-2"
          align="end"
          side={isMobile ? "bottom" : "bottom"}
          sideOffset={8}
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2 p-2">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1 items-start">
                <span className="truncate text-sm font-medium">
                  {user.name || "Guest"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
            <Separator className="my-1 border-t border-zinc-200" />
            {userActions.map((action, index) => {
              const isDestructive = action.label === "Log out";
              return (
                <React.Fragment key={index}>
                  {isDestructive && (
                    <Separator className="my-1 border-t border-zinc-200" />
                  )}
                  <div
                    onClick={() => handleActionClick(action.action, action.url)}
                    className={`flex items-center gap-2 p-2 text-sm rounded cursor-pointer ${
                      isDestructive
                        ? "text-red-600 hover:bg-red-50"
                        : "hover:bg-zinc-100"
                    }`}
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

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
