import {
  Edge,
} from "@xyflow/react";
import { CustomNode } from "../../utils/helpers/canvas";
import { InputVariable } from "../../utils/objects/node-type-registry";
/**
 * TypeScript types corresponding to Pipeline DTO classes
 * These types can be used for type safety in frontend applications or other TypeScript contexts
 */

export type Position = {
  x: number;
  y: number;
};

export type Measured = {
  width: number;
  height: number;
};

export type NodeData = {
  id: string;
  type: string;
  name: string;
  description: string;
  color?: string;
  isEditingName?: boolean;
  isEditingDescription?: boolean;
  formData?: Record<string, any>;
  additionalData?: Record<string, any>;
  input_variables?: InputVariable[];
  streaming_details?: Record<string, any>;
};

export type Node = {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
  measured?: Measured;
  selected?: boolean;
  dragging?: boolean;
};

export type EdgeStyle = {
  stroke?: string;
  strokeWidth?: number;
};

export type PipelineEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  style?: EdgeStyle;
  animated?: boolean;
  selected?: boolean;
};

export type CreateNodeInput = {
  _id: string;
  type: string;
  name: string;
  description?: string;
  data?: Record<string, any>;
  connections?: string[];
};

export type CreatePipeline = {
  name: string;
  nodes?: Node[];
  edges?: PipelineEdge[];
};

export type CreatePipelineInput = {
  name: string;
  nodes?: CreateNodeInput[];
};

export type UpdatePipeline = {
  name?: string;
  nodes?: Node[];
  edges?: PipelineEdge[];
};

export type UpdatePipelineInput = {
  name?: string;
  nodes?: CreateNodeInput[];
};

export type UpdatePipelineFlow = {
  nodes: Node[];
  edges: PipelineEdge[];
};

export type UpdatePipelineFlowInput = {
  nodes: Node[];
  edges: PipelineEdge[];
};

// Union types for convenience
export type PipelineNode = Node;
export type PipelinePosition = Position;
export type PipelineMeasured = Measured;
export type PipelineNodeData = NodeData;
export type PipelineEdgeStyle = EdgeStyle;

// Utility types
export type NodeType = string;
export type NodeId = string;
export type EdgeId = string;
export type PipelineName = string;

// Flow-related types
export type PipelineFlow = {
  nodes: Node[];
  edges: PipelineEdge[];
};

// Complete pipeline structure type
export type Pipeline = {
  _id: string;
  name: string;
  nodes: CustomNode[];
  edges: Edge[];
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type TemplatePipeline = {
  id: string;
  title: string;
  description: string;
  features: string[];
};
