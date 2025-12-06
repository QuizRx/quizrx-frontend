"use client";

import {
  ArrowBigRight,
  AudioWaveform,
  BoxIcon,
  Check,
  ChevronsUpDown,
  Command,
  Database,
  GalleryVerticalEnd,
  LucideLayoutDashboard,
  Users2,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/core/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/core/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { useRouter, usePathname } from "next/navigation";

export function RepoSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const repositories = React.useMemo(
    () =>
      [
        {
          name: "Assistant",
          logo: Command,
          isActive: true,
          url: "/dashboard",
        },
        {
          name: "Data Config",
          logo: Database,
          isActive: true,
          // url: "/configuration/configure-data",
          url: "/data-config",
        },
        {
          name: "Model Config",
          logo: BoxIcon,
          isActive: true,
          url: "/model-config",
        },
        {
          name: "Concepts",
          logo: AudioWaveform,
          isActive: true,
          url: "/concepts",
        },
           {
          name: "Inference Console",
          logo: LucideLayoutDashboard,
          isActive: true,
          url: "/console",
        },
      ].filter((repo) => repo.url),
    []
  );

  // Memoize the active team calculation
  const activeTeam = React.useMemo(() => {
    if (!pathname) return repositories[0];

    // Find the most specific match (longest matching URL prefix)
    const matchedRepos = repositories
      .filter((repo) => repo.url && pathname.startsWith(repo.url))
      .sort((a, b) => (b.url?.length || 0) - (a.url?.length || 0));

    return matchedRepos[0] || repositories[0];
  }, [pathname, repositories]);

  const handleTeamSelect = (team: (typeof repositories)[0]) => {
    if (!team.isActive || !team.url) return;
    router.push(team.url);
  };

  if (!activeTeam || repositories.length === 0) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {repositories.map((team) => (
              <Tooltip key={team.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenuItem
                      onClick={() => handleTeamSelect(team)}
                      className={`gap-2 p-2 ${
                        !team.isActive ? "opacity-50 cursor-not-allowed" : ""
                      } ${activeTeam.name === team.name ? "bg-accent" : ""}`}
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <team.logo className="size-4 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        {team.name}
                        {!team.isActive && (
                          <Badge variant="glow" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {activeTeam.name === team.name && (
                        <Check className="size-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                {!team.isActive && (
                  <TooltipContent side="right" className="max-w-[400px]">
                    This repository is not currently activated. Please contact
                    our customer support team to have it activated.
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
