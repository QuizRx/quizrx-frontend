"use client";

import { ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import NodeItem from "@/modules/concepts/components/canvas/node-item";
import {
  NodeTypeRegistry,
  NodeTypes,
  BasicNodes,
  ModuleNodes,
  UtilityNodes,
} from "@/modules/concepts/utils/objects/node-type-registry";

export function CanvasAppSidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Get all node types from the registry
  const nodeTypes = Object.keys(NodeTypeRegistry);

  // Filter node types based on search term
  const filteredNodeTypes = nodeTypes.filter((type) => {
    const config = NodeTypeRegistry[type];
    return (
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <div
      className={`h-[90vh] flex flex-col px-4` + (isOpen ? "w-1/4" : "w-[20px]")}
    >
      <div
        {...props}
        className={cn(
          "h-full border-r transition-all duration-500 ease-in-out backdrop-blur-xl z-10",
          isOpen ? "w-[300px] overflow-y-scroll" : "w-[20px] overflow-hidden",
          className
        )}
      >
        <div
          className={cn(
            "h-full w-full px-4 pt-0 transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="py-4">
            <h2 className="text-md font-medium">Concepts Editor</h2>
            <p className="text-xs text-muted-foreground pt-2">
              Build and manage your concepts with ease.
            </p>
            {/* <div className="mt-5">
              <CanvasSearchForm onSearch={handleSearch} />
            </div> */}
          </div>
          <div>
            <section>
               <h3 className="py-3 text-sm text-muted-foreground font-medium">
                Basic
              </h3>
              <div className="space-y-5">
                {filteredNodeTypes.filter((nodeType) => BasicNodes.includes(nodeType)).map((nodeType) => (
                  <NodeItem key={nodeType} nodeType={nodeType} />
                ))}
              </div>
              <h3 className="py-3 text-sm text-muted-foreground font-medium">
                Modules
              </h3>
              <div className="space-y-5">
                {filteredNodeTypes.filter((nodeType) => ModuleNodes.includes(nodeType)).map((nodeType) => (
                  <NodeItem key={nodeType} nodeType={nodeType} />
                ))}
              </div>
              <h3 className="py-3 text-sm text-muted-foreground font-medium">
                Utilities
              </h3>
              <div className="space-y-5">
                {filteredNodeTypes.filter((nodeType) => UtilityNodes.includes(nodeType)).map((nodeType) => ( 
                  <NodeItem key={nodeType} nodeType={nodeType} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-md p-0 border-none z-20 cursor-pointer transition-all duration-500 ease-in-out",
          isOpen ? "left-[288px]" : "left-0 ml-1"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-500 ease-in-out text-white",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </Button>
    </div>
  );
}
