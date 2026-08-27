"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { cn } from "@/core/lib/utils";
import { CALCIUM_BONE_CHAINS, findChainById } from "../data/chains";

type TopicDropdownProps = {
  className?: string;
  selectedChainId: string | null;
  onSelectChain: (chainId: string | null) => void;
};

export function TopicDropdown({
  className,
  selectedChainId,
  onSelectChain,
}: TopicDropdownProps) {
  const selected = findChainById(selectedChainId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-full border border-[var(--primary)] bg-white px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 sm:w-auto sm:justify-center",
            className
          )}
        >
          <span className="truncate">{selected ? selected.label : "Choose Topic"}</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="max-h-[60vh] w-72 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl"
      >
        <DropdownMenuItem
          onSelect={() => onSelectChain(null)}
          className={cn(
            "cursor-pointer rounded-lg px-3 py-2 text-sm",
            !selectedChainId
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "text-zinc-700 hover:bg-zinc-100"
          )}
        >
          None
        </DropdownMenuItem>
        {CALCIUM_BONE_CHAINS.map((chain) => {
          const isActive = chain.chainId === selectedChainId;
          return (
            <DropdownMenuItem
              key={chain.chainId}
              onSelect={() => onSelectChain(chain.chainId)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-2 text-sm",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-zinc-700 hover:bg-zinc-100"
              )}
            >
              {chain.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
