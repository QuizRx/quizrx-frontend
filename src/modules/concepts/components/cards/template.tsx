"use client";

import { Check, Grid } from "lucide-react";
import type { TemplatePipeline } from "../../types/api/pipeline";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/core/components/ui/card";

interface TemplateCardProps {
  template: TemplatePipeline;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="h-full flex flex-col aspect-2/2.9">
      <CardHeader className="pb-2">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center p-2 border border-primary rounded-md">
            <Grid className="w-5 h-5" />
          </div>
        </div>
        <h2 className="text-md font-medium">{template.title}</h2>
        <p className="text-xs text-muted-foreground">{template.description}</p>
      </CardHeader>

      <CardContent className="flex-grow min-w-72 pt-5">
        <div className="space-y-3">
          {template.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-thin">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full">Launch</Button>
      </CardFooter>
    </Card>
  );
}
