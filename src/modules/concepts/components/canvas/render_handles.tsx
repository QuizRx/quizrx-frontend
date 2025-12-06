import { BaseHandle } from "@/core/components/ui/base-handle";
import { Position } from "@xyflow/react";
import { NodeTypes } from "../../utils/objects/node-type-registry";
import { nodeHandles } from "../../utils/objects/node-handles";

interface RenderHandlesProps {
  nodeType: NodeTypes | string;
  nodeData?: any;
}

export const renderHandles = ({ nodeType, nodeData }: RenderHandlesProps) => {
  // Check if the nodeType exists in our nodeHandles record
  if (nodeType in nodeHandles) {
    return nodeHandles[nodeType as NodeTypes](nodeData);
  }
  
  // Fallback for unknown node types
  return (
    <>
      {/* Default handles */}
      <BaseHandle
        id="input"
        type="target"
        position={Position.Left}
        className="!bg-primary"
        style={{ top: '50%' }}
        connectionCount={3}
      />
      <BaseHandle
        id="output"
        type="source"
        position={Position.Right}
        className="!bg-primary"
        style={{ top: '50%' }}
        connectionCount={3}
      />
    </>
  );
};
