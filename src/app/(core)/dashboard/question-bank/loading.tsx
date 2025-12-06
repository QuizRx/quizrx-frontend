import { Skeleton } from "@/core/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";

export default function Loading() {
  return (
    <div className="mx-auto px-4 py-6 bg-transparent flex flex-col h-[90vh]">
      {/* Page Title Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Separator */}
      <div className="my-4 h-px bg-border" />

      {/* Action Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="border-b pb-8">
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-primary/15">
              <TableRow>
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                {Array.from({ length: 4 }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  {Array.from({ length: 4 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

