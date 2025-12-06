import { NodeTypes, UtilityNodes } from "./node-type-registry"
import { Edge } from "@xyflow/react";

export interface ConnectionValidationParams {
  sourceType: NodeTypes;
  targetType: NodeTypes;
  sourceHandle?: string;
  targetHandle?: string;
  targetNodeId: string;
  edges: Edge[];
}

export const handleConnection: Record<NodeTypes, (params: ConnectionValidationParams) => boolean> = {
  start: ({ targetType, sourceHandle, targetHandle }) => {
    // can to connect to agent input or router input
    if (sourceHandle === 'source') {
      if (targetType === 'agent' && targetHandle === 'input') return true;
      if (targetType === 'router' && targetHandle === 'input') return true;
      return false;
    }
    return false;
  },

  router: ({ targetType, sourceHandle, targetHandle }) => {
    // Router choice handles can connect to agent inputs
    if (sourceHandle?.startsWith('choice-')) {
      if (targetType === 'agent' && targetHandle === 'input') {
        // Allow multiple router choices to connect to the same agent
        // This is valid for routing scenarios where different paths lead to the same agent
        return true;
      }
      if (targetType === 'router' && targetHandle === 'input') return true;
      return false;
    }
    // Legacy router output handle (keeping for backwards compatibility)
    if (sourceHandle === 'output') {
      if (targetType === 'agent' && targetHandle === 'input') return true;
      return false;
    }
    return false;
  },

  agent: ({ targetType, sourceHandle, targetHandle }) => {
    // Agent can connect tools via tools handle
    
    if (sourceHandle === 'tools') {
      if (UtilityNodes.includes(targetType) && targetHandle === 'input') return true;
      return false;
    }
    // Agent output can connect to other agents or routers (for chaining)
    if (sourceHandle === 'output') {
      if (targetType === 'agent' && targetHandle === 'input') return true;
      if (targetType === 'router' && targetHandle === 'input') return true;
      if (targetType === 'end' && targetHandle === 'input') return true;
      return false;
    }
    return false;
  },

  tool: () => {
    // Tools cannot initiate connections (they only receive from agents)
    return false;
  },
  end: () => {
    // End nodes cannot initiate connections (assuming they are terminal nodes)
    return false;
  }
};