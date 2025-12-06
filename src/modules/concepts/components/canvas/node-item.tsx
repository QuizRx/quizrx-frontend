import { Plus } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";
import {
  NodeTypeConfig,
  NodeTypeRegistry,
  NodeTypes,
} from "../../utils/objects/node-type-registry";

interface NodeItemProps {
  nodeType: NodeTypes;
  config?: NodeTypeConfig;
}

const NodeItemDraggable = ({ nodeType, config }: NodeItemProps) => {
  // Get node config from registry or use provided config
  const nodeConfig = config || NodeTypeRegistry[nodeType];

  if (!nodeConfig) {
    console.error(`Node type '${nodeType}' not found in registry`);
    return null;
  }

  const { name, description, Icon, color } = nodeConfig;

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // Only need to pass the node type - the registry will handle the rest
    const dragData = {
      type: nodeType,
    };

    // Set a proper MIME type and stringify the data
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(dragData)
    );
  };

  const handleAddNode = () => {
    // Dispatch an event with just the node type
    const event = new CustomEvent("addNode", {
      detail: {
        nodeType,
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between w-full p-3 rounded-lg border",
        "hover:bg-muted cursor-grab transition-colors group"
      )}
      draggable
      onDragStart={onDragStart}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-6 w-6 rounded-md flex items-center justify-center"
          style={{
            backgroundColor: color ? `${color}20` : "transparent",
          }}
        >
          {Icon && (
            <Icon
              className={`h-6 w-6 ${
                color
                  ? `text-${color} backdrop-filter backdrop-blur bg-${color}/20`
                  : "text-foreground"
              }`}
            />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{name}</span>
          {description && (
            <span className="text-xs text-muted-foreground hidden group-hover:block">
              {description}
            </span>
          )}
        </div>
      </div>
      <Button
        className="focus:outline-none"
        variant="link"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleAddNode();
        }}
      >
        <Plus className="text-muted-foreground h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </div>
  );
};

export default NodeItemDraggable;
