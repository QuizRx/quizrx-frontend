"use client";

import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { GET_USER_QUESTION_BANKS_QUERY } from "../../apollo/query/question-bank";
import useFilterStore from "../../store/filter-store";

export default function FilterDialog() {
  const { topic, isFilterOpen, setTopic, setIsFilterOpen, resetFilters } =
    useFilterStore();

  // Fetch question banks data
  const { data, loading, error } = useQuery(GET_USER_QUESTION_BANKS_QUERY);

  // Extract unique tags from question banks
  const topics = ["all"]; // Start with 'all' option
  useEffect(() => {
    if (data?.getUserQuestionBanks?.data) {
      const allTags = data.getUserQuestionBanks.data.flatMap(
        (bank) => bank.tags || []
      );
      const uniqueTags = [...new Set(allTags)].filter(Boolean);
      topics.push(...uniqueTags);
    }
  }, [data]);

  return (
    <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Filter</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Filter questions based on your needs.
          </p>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Question Topic</label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading topics...
                  </SelectItem>
                ) : error ? (
                  <SelectItem value="error" disabled>
                    Error loading topics
                  </SelectItem>
                ) : (
                  topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsFilterOpen(false)}>Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
