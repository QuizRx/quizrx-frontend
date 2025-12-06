import React from 'react';
import { Button } from '@/core/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage?: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onNextPage,
  onPrevPage,
  onGoToPage,
  isLoading = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        onClick={onPrevPage}
        disabled={!pagination.hasPrevPage || isLoading}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
        </div>

        <div className="text-sm text-gray-600">
          {pagination.totalItems} total items
        </div>

        {onGoToPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Go to:</span>
            <input
              type="number"
              min="1"
              max={pagination.totalPages}
              className="w-16 px-2 py-1 border rounded text-sm"
              placeholder={pagination.currentPage.toString()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.currentTarget.value);
                  if (page >= 1 && page <= pagination.totalPages) {
                    onGoToPage(page);
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      <Button
        onClick={onNextPage}
        disabled={!pagination.hasNextPage || isLoading || pagination.currentPage >= pagination.totalPages}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};