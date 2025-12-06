import { Sparkles } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Skeleton } from "@/core/components/ui/skeleton";

const UnderConstructionLayout = () => {
  return (
    <div className="h-full w-full relative">
      {/* Dashboard Layout Skeleton */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Skeleton className="aspect-video rounded-xl" />
        <Skeleton className="aspect-video rounded-xl" />
        <Skeleton className="aspect-video rounded-xl" />
      </div>
      <Skeleton className="min-h-[100vh] h-full flex-1 rounded-xl bg-primary/5 md:min-h-min mt-10" />

      {/* Overlay Card */}
      <div className="absolute top-0 bottom-0 inset-0 flex flex-col h-full items-center justify-center bg-background/60 backdrop-blur-sm">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex flex-row gap-2 items-center">
              <Sparkles className="w-8 h-8 text-primary animate-bounce" />
              To Be Constructed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            This section is under construction. Please check back later.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnderConstructionLayout;
