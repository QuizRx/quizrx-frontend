"use client";

import { Search } from "lucide-react";
import { Input } from "@/core/components/ui/input";
import { useCallback, useState } from "react";

interface CanvasSearchFormProps {
  onSearch?: (term: string) => void;
}

export const CanvasSearchForm = ({ onSearch }: CanvasSearchFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);

      if (onSearch) {
        onSearch(value);
      }
    },
    [onSearch]
  );

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder="Search modules..."
        className="pl-10 w-full h-9"
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
};
