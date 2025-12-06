import { Filter, Search } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";

export type TableTitleHeaderProps = {
  title: string;
  description: string;
  onSearchTextChange?: (text: string) => void;
  onFilterChange?: (filters: unknown) => void;
};

export function TableTitleHeader({
  title,
  description,
  onSearchTextChange,
  onFilterChange,
}: TableTitleHeaderProps) {
  return (
    <div className="flex max-md:flex-col md:justify-between">
      <div>
        <h1 className="text-xl mb-1">{title}</h1>
        <p className="text-foreground/50 mb-6">{description}</p>
      </div>
      <div className="flex gap-3 items-center">
        {onSearchTextChange && (
          <div className="relative">
            <Search className="absolute inset-y-0 left-2 m-auto h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="bg-transparent pl-8 h-10"
              onChange={(e) => onSearchTextChange(e.target.value)}
            />
          </div>
        )}
        {onFilterChange && <Filter className="text-muted-foreground h-4 w-4" />}
      </div>
    </div>
  );
}
