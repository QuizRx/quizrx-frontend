import { NodeTypes } from "./node-type-registry"
import { BaseHandle } from "@/core/components/ui/base-handle";
import { Position } from "@xyflow/react";
import { RouterFormData } from "../../layouts/forms/canvas/router";
import { ReactElement } from "react";

// Import the connection validation types
interface ConnectionValidationParams {
  sourceType: NodeTypes;
  targetType: NodeTypes;
  sourceHandle?: string;
  targetHandle?: string;
  targetNodeId: string;
  edges: any[];
}

// Handle rendering function type
type HandleRendererFunction = (nodeData?: any) => ReactElement;

// Node handles record for rendering handles
export const nodeHandles: Record<NodeTypes, HandleRendererFunction> = {
  start: () => (
    <>
      {/* Start node only has output */}
      <BaseHandle
        id="source"
        type="source"
        position={Position.Right}
        className="!bg-green-500"
        style={{ top: '50%' }}
        connectionCount={1}
      />
    </>
  ),

  router: (nodeData) => {
    const routerFormData = nodeData?.formData as RouterFormData;
    const routes = routerFormData?.routes || [];
    
    return (
      <>
        {/* Router has input */}
        <BaseHandle
          id="input"
          type="target"
          position={Position.Left}
          className="!bg-blue-500"
          style={{ top: '50%' }}
          connectionCount={1}
        />
        
        {/* Dynamic output handles for each route choice */}
        {routes.map((route, index) => {
          const topOffset = routes.length === 1 
            ? '50%' 
            : `${(100 / (routes.length + 1)) * (index + 1)}%`;

          return (
            <span key={`choice-${index}`}>
              <BaseHandle
                id={`choice-${index}`}
                type="source"
                position={Position.Right}
                className="!bg-yellow-500"
                style={{ top: topOffset }}
                connectionCount={1}
              />
              {/* Choice label */}
              <div 
                className="absolute text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded border whitespace-nowrap pointer-events-none"
                style={{ 
                  top: topOffset,
                  left: '100%',
                  transform: 'translateY(-50%)',
                  marginLeft: '8px',
                  zIndex: 10
                }}
              >
                {route.choice || `Choice ${index + 1}`}
              </div>
            </span>
          );
        })}
        
        {/* If no routes, show a default output handle */}
        {routes.length === 0 && (
          <BaseHandle
            id="output-default"
            type="source"
            position={Position.Right}
            className="!bg-gray-400"
            style={{ top: '50%' }}
            connectionCount={1}
          />
        )}
      </>
    );
  },

  agent: () => (
    <>
      {/* Agent has input, tools, and output */}
      <BaseHandle
        id="input"
        type="target"
        position={Position.Left}
        className="!bg-blue-500"
        style={{ top: '50%' }}
        connectionCount={1}
      />
      <BaseHandle
        id="tools"
        type="source"
        position={Position.Bottom}
        className="!bg-orange-500"
        style={{ left: '50%' }}
        connectionCount={100}
      />
      <BaseHandle
        id="output"
        type="source"
        position={Position.Right}
        className="!bg-green-500"
        style={{ top: '50%' }}
        connectionCount={100}
      />
    </>
  ),
  api: () => (
    <>
      {/* Tool can accept multiple inputs from different agents */}
      <BaseHandle
        id="input"
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        style={{ left: '50%' }}
        connectionCount={100}
      />
    </>
  ),
  vector_retriever: () => (
    <>
      {/* Tool can accept multiple inputs from different agents */}
      <BaseHandle
        id="input"
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        style={{ left: '50%' }}
        connectionCount={100}
      />
    </>
  ),
  graph_retriever: () => (
    <>
      {/* Tool can accept multiple inputs from different agents */}
      <BaseHandle
        id="input"
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        style={{ left: '50%' }}
        connectionCount={100}
      />
    </>
  ),

  end: () => (
    <>
      {/* End node handles - you can customize these as needed */}
      <BaseHandle
        id="input"
        type="target"
        position={Position.Left}
        className="!bg-red-500"
        style={{ top: '50%' }}
        connectionCount={100}
      />
    </>
  )
};