import PageTitle from "@/core/layouts/common/page-title";
import { ListFilter } from "lucide-react";
import { Badge } from "../../../../core/components/ui/badge";
import FilterDialog from "@/modules/chat/layouts/forms/filter-dialog";
import ActiveFilters from "@/modules/chat/layouts/forms/active-filter";
import useFilterStore from "../../store/filter-store";
import { Button } from "@/core/components/ui/button";
import React from "react";
import { SearchIcon } from "lucide-react";

const PageFilterHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const { topic, difficulty, setIsFilterOpen } = useFilterStore();

  // Calculate active filters count for the badge
  const activeFiltersCount =
    (topic !== "all" ? 1 : 0) + (difficulty !== "all" ? 1 : 0);

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <PageTitle
          title={title}
          description={description}
          showSeparator={false}
        />

        {/* Search Bar */}
        {/* <Search /> */}

        {/* Filter Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => setIsFilterOpen(true)}
        >
          <ListFilter size={16} />
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 bg-blue-500 hover:bg-blue-600">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      <FilterDialog />
      <ActiveFilters />
    </div>
  );
};

const Search: React.FC = () => {
  return (
    <label className="[&:has(:focus-visible)]:ring-ring flex items-center [&:has(:focus-visible)]:ring-2 border p-3 rounded-lg">
      <span className="sr-only">Search</span>

      <SearchIcon className="size-4" />
      <input
        type="search"
        placeholder="Search topics..."
        className="size-full ml-2 border-none bg-transparent focus:outline-none text-xs"
      />
    </label>
  );
};

export default PageFilterHeader;
