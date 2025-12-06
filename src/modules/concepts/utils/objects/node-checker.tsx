import { Edge, Node } from "@xyflow/react";
import { NodeTypes } from "./node-type-registry";

// Define the node data interface based on the existing codebase structure
interface NodeData {
  id: string;
  type: NodeTypes;
  name: string;
  description: string;
  formData?: {
    system_prompt?: string;
    routes?: Array<{
      label: string;
      condition: string;
      target_agent: string;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

// Define custom node type extending the base Node
interface CustomNode extends Node {
  data: NodeData;
}

// Error types for different validation failures
export interface ValidationError {
  type: 'single_start' | 'multiple_start' | 'empty_system_prompt' | 'empty_routes' | 'todo_implementation' | 'missing_agent_connection' | 'no_path_to_end' | 'invalid_start_connection' | 'no_start_node' | 'no_end_node' | 'missing_api_config' | 'missing_vector_config' | 'missing_graph_config';
  message: string;
  nodeId?: string;
  nodeName?: string;
  category: 'general' | 'node' | 'edge';
}

// Node validation function type
type NodeValidationFunction = (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => ValidationError | null;

// Edge validation function type
type EdgeValidationFunction = (nodes: CustomNode[], edges: Edge[]) => ValidationError[];

// General validation function type
type GeneralValidationFunction = (nodes: CustomNode[], edges: Edge[]) => ValidationError[];

// =============================================================================
// NODE CHECKER - Individual node validation functions
// =============================================================================

const NodeChecker: Record<NodeTypes, NodeValidationFunction> = {
  start: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    // Check if start node is properly connected
    const startConnections = edges.filter(edge => edge.source === node.id);
    
    if (startConnections.length === 0) {
      return {
        type: 'invalid_start_connection',
        message: 'Start node is not connected to any other node. Please connect the start node to an agent or router.',
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    const validTargetTypes = ['agent', 'router'];
    const hasValidConnection = startConnections.some(edge => {
      const targetNode = allNodes.find(n => n.id === edge.target);
      return targetNode && validTargetTypes.includes(targetNode.data.type);
    });

    if (!hasValidConnection) {
      return {
        type: 'invalid_start_connection',
        message: 'Start node must be connected to an agent or router node. Please check your connections.',
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    return null;
  },

  end: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    // End nodes don't have specific validation requirements for now
    return null;
  },

  agent: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    // Check for empty system prompt
    const systemPrompt = node.data.formData?.system_prompt;
    if (!systemPrompt || systemPrompt.trim() === '') {
      return {
        type: 'empty_system_prompt',
        message: `Agent "${node.data.name}" has an empty system prompt. Please provide a system prompt for this agent.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    return null;
  },

  router: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    // Check for empty routes
    const routes = node.data.formData?.routes;
    if (!routes || routes.length === 0) {
      return {
        type: 'empty_routes',
        message: `Router "${node.data.name}" has no routes configured. Please add at least one route for this router.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    return null;
  },
  api: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    // Check API configuration using the new apiFormData structure
    const formData = node.data.formData;
    
    // Check if basic structure exists
    if (!formData || formData.tool_type !== 'api') {
      return {
        type: 'missing_api_config',
        message: `API node "${node.data.name}" is missing basic configuration. Please configure the API tool.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    // Check schema configuration
    const schema = formData.schema;
    if (!schema || !schema.function || !schema.function.name || schema.function.name.trim() === '') {
      return {
        type: 'missing_api_config',
        message: `API node "${node.data.name}" is missing function name. Please provide a function name in the schema.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    if (!schema.function.description || schema.function.description.trim() === '') {
      return {
        type: 'missing_api_config',
        message: `API node "${node.data.name}" is missing function description. Please provide a function description.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    // Check execution configuration
    const execution = formData.execution;
    if (!execution || !execution.url || execution.url.trim() === '') {
      return {
        type: 'missing_api_config',
        message: `API node "${node.data.name}" is missing API endpoint URL. Please configure the API endpoint.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    // Validate URL format
    try {
      // Allow URLs with template parameters like {{param}}
      const urlToValidate = execution.url.replace(/\{\{[^}]+\}\}/g, 'placeholder');
      new URL(urlToValidate);
    } catch (error) {
      return {
        type: 'missing_api_config',
        message: `API node "${node.data.name}" has an invalid URL format. Please provide a valid URL.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    return null;
  },

  vector_retriever: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    // Check vector retriever configuration
    const formData = node.data.formData;
    if (!formData?.database_url || formData.database_url.trim() === '' || 
        !formData?.collection_name || formData.collection_name.trim() === '') {
      return {
        type: 'missing_vector_config',
        message: `Vector Retriever "${node.data.name}" is missing required configuration (database URL or collection name).`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    return null;
  },

  graph_retriever: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    // Check graph retriever configuration
    const formData = node.data.formData;
    if (!formData?.graph_database_url || formData.graph_database_url.trim() === '') {
      return {
        type: 'missing_graph_config',
        message: `Graph Retriever "${node.data.name}" is missing graph database URL configuration.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      };
    }

    return null;
  },

  // For unknown types, return TODO implementation error
  trigger: (node: CustomNode, allNodes: CustomNode[], edges: Edge[]) => {
    return {
      type: 'todo_implementation',
      message: `${node.data.name} (${node.data.type}) validation is not yet implemented. This node type is marked as TODO.`,
      nodeId: node.id,
      nodeName: node.data.name,
      category: 'node'
    };
  }
};

// =============================================================================
// EDGE CHECKER - Edge-related validation functions
// =============================================================================

const EdgeChecker = {
  // Check if all agents have valid outgoing connections
  validateAgentConnections: (nodes: CustomNode[], edges: Edge[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const agentNodes = nodes.filter(node => node.data.type === 'agent');
    
    agentNodes.forEach(node => {
      const outgoingEdges = edges.filter(edge => edge.source === node.id);
        if (outgoingEdges.length === 0) {
        errors.push({
          type: 'missing_agent_connection',
          message: `Agent "${node.data.name}" is not connected to any node. Agents must be connected to another agent, router, or end node.`,
          nodeId: node.id,
          nodeName: node.data.name,
          category: 'edge'
        });
      } else {
        // Check if at least one connection is to a valid target type
        const validTargetTypes = ['agent', 'router', 'end'];
        const hasValidConnection = outgoingEdges.some(edge => {
          const targetNode = nodes.find(n => n.id === edge.target);
          return targetNode && validTargetTypes.includes(targetNode.data.type);
        });
        
        if (!hasValidConnection) {
          errors.push({
            type: 'missing_agent_connection',
            message: `Agent "${node.data.name}" must be connected to another agent, router, or end node. Please check your connections.`,
            nodeId: node.id,
            nodeName: node.data.name,
            category: 'edge'
          });
        }
      }
    });

    return errors;
  },

  // Check if there's a path from start to end
  validateStartToEndPath: (nodes: CustomNode[], edges: Edge[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const startNodes = nodes.filter(node => node.data.type === 'start');
    const endNodes = nodes.filter(node => node.data.type === 'end');

    if (startNodes.length === 1 && endNodes.length > 0) {
      const startNode = startNodes[0];
      const hasPathToEnd = endNodes.some(endNode => 
        hasPath(startNode.id, endNode.id, edges, nodes)
      );
      
      if (!hasPathToEnd) {
        errors.push({
          type: 'no_path_to_end',
          message: 'No valid path exists from the start node to any end node. Please ensure your workflow has a complete path from start to end.',
          category: 'edge'
        });
      }
    }

    return errors;
  }
};

// =============================================================================
// GENERAL CHECKER - Overall workflow validation functions
// =============================================================================

const GeneralChecker = {
  // Check for single start node
  validateSingleStart: (nodes: CustomNode[], edges: Edge[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const startNodes = nodes.filter(node => node.data.type === 'start');

    if (startNodes.length === 0) {
      errors.push({
        type: 'no_start_node',
        message: 'No start node found. Please add exactly one start node to your workflow.',
        category: 'general'
      });
    } else if (startNodes.length > 1) {
      errors.push({
        type: 'multiple_start',
        message: `Multiple start nodes found (${startNodes.length}). Please ensure only one start node exists in your workflow.`,
        category: 'general'
      });
    }

    return errors;
  },

  // Check for end node existence
  validateEndNodeExists: (nodes: CustomNode[], edges: Edge[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const endNodes = nodes.filter(node => node.data.type === 'end');

    if (endNodes.length === 0) {
      errors.push({
        type: 'no_end_node',
        message: 'No end node found. Please add at least one end node to your workflow.',
        category: 'general'
      });
    }

    return errors;
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Checks if there is a path between two nodes using breadth-first search
 * @param startNodeId - ID of the starting node
 * @param endNodeId - ID of the target node
 * @param edges - Array of edges in the graph
 * @param nodes - Array of nodes in the graph
 * @returns true if a path exists, false otherwise
 */
function hasPath(startNodeId: string, endNodeId: string, edges: Edge[], nodes: CustomNode[]): boolean {
  if (startNodeId === endNodeId) return true;

  const visited = new Set<string>();
  const queue = [startNodeId];
  visited.add(startNodeId);

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    
    // Find all outgoing edges from current node
    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);
    
    for (const edge of outgoingEdges) {
      const targetNodeId = edge.target;
      
      if (targetNodeId === endNodeId) {
        return true; // Found path to end
      }
      
      if (!visited.has(targetNodeId)) {
        visited.add(targetNodeId);
        queue.push(targetNodeId);
      }
    }
  }
  
  return false; // No path found
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Validates the workflow nodes and edges using the refactored checker system
 * @param nodes - Array of nodes in the workflow
 * @param edges - Array of edges connecting the nodes
 * @returns Array of validation errors (empty if all validations pass)
 */
export function validateWorkflow(nodes: CustomNode[], edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. GENERAL VALIDATIONS
  console.log("Starting general validations...");
  console.log(`Nodes: ${JSON.stringify(nodes, null, 2)}`);
  errors.push(...GeneralChecker.validateSingleStart(nodes, edges));
  errors.push(...GeneralChecker.validateEndNodeExists(nodes, edges));

  // 2. NODE VALIDATIONS
  nodes.forEach(node => {
    const nodeType = node.data.type as NodeTypes;
    const validationFunction = NodeChecker[nodeType];
    
    if (validationFunction) {
      const error = validationFunction(node, nodes, edges);
      if (error) {
        errors.push(error);
      }
    } else {
      // Handle unknown node types
      errors.push({
        type: 'todo_implementation',
        message: `${node.data.name} (${node.data.type}) validation is not yet implemented. This node type is marked as TODO.`,
        nodeId: node.id,
        nodeName: node.data.name,
        category: 'node'
      });
    }
  });
  // 3. EDGE VALIDATIONS
  errors.push(...EdgeChecker.validateAgentConnections(nodes, edges));
  errors.push(...EdgeChecker.validateStartToEndPath(nodes, edges));

  return errors;
}

/**
 * Creates a toast message for validation errors
 * @param errors - Array of validation errors
 * @param toast - Toast function from useToast hook
 */
export function showValidationErrors(errors: ValidationError[], toast: (options: any) => void) {
  if (errors.length === 0) {
    toast({
      title: "Validation Successful",
      description: "Your workflow configuration is valid!",
      variant: "default"
    });
    return;
  }

  // Group errors by category and type for better presentation
  const errorsByCategory = errors.reduce((groups, error) => {
    if (!groups[error.category]) {
      groups[error.category] = {};
    }
    if (!groups[error.category][error.type]) {
      groups[error.category][error.type] = [];
    }
    groups[error.category][error.type].push(error);
    return groups;
  }, {} as Record<string, Record<string, ValidationError[]>>);

  // Show different toasts for different categories and error types
  Object.entries(errorsByCategory).forEach(([category, typeGroups]) => {
    Object.entries(typeGroups).forEach(([type, typeErrors]) => {
      const errorCount = typeErrors.length;
      let title = "";
      let description = "";

      switch (type) {
        case 'no_start_node':
          title = "Missing Start Node";
          description = typeErrors[0].message;
          break;
        case 'multiple_start':
          title = "Multiple Start Nodes";
          description = typeErrors[0].message;
          break;
        case 'no_end_node':
          title = "Missing End Node";
          description = typeErrors[0].message;
          break;
        case 'empty_system_prompt':
          title = `Agent Configuration Error${errorCount > 1 ? 's' : ''}`;
          description = errorCount === 1 
            ? typeErrors[0].message
            : `${errorCount} agents have empty system prompts. Please configure all agent prompts.`;
          break;
        case 'empty_routes':
          title = `Router Configuration Error${errorCount > 1 ? 's' : ''}`;
          description = errorCount === 1
            ? typeErrors[0].message
            : `${errorCount} routers have no routes configured. Please add routes to all routers.`;
          break;
        case 'missing_api_config':
          title = `API Configuration Error${errorCount > 1 ? 's' : ''}`;
          description = errorCount === 1
            ? typeErrors[0].message
            : `${errorCount} API nodes are missing configuration. Please configure all API endpoints.`;
          break;
        case 'missing_vector_config':
          title = `Vector Retriever Configuration Error${errorCount > 1 ? 's' : ''}`;
          description = errorCount === 1
            ? typeErrors[0].message
            : `${errorCount} vector retrievers are missing configuration.`;
          break;
        case 'missing_graph_config':
          title = `Graph Retriever Configuration Error${errorCount > 1 ? 's' : ''}`;
          description = errorCount === 1
            ? typeErrors[0].message
            : `${errorCount} graph retrievers are missing configuration.`;
          break;
        case 'todo_implementation':
          title = "TODO Implementation";
          description = errorCount === 1
            ? typeErrors[0].message
            : `${errorCount} nodes have validation marked as TODO and need implementation.`;
          break;        case 'missing_agent_connection':
          title = `Missing Connection${errorCount > 1 ? 's' : ''}`;
          description = errorCount === 1
            ? typeErrors[0].message
            : `${errorCount} agents are not connected to valid nodes. All agents must be connected to other agents, routers, or end nodes.`;
          break;
        case 'no_path_to_end':
          title = "Workflow Path Error";
          description = typeErrors[0].message;
          break;
        case 'invalid_start_connection':
          title = "Start Node Connection Error";
          description = typeErrors[0].message;
          break;
        default:
          title = `${category.charAt(0).toUpperCase() + category.slice(1)} Validation Error`;
          description = typeErrors[0].message;
      }

      toast({
        variant: "destructive",
        title: `[${category.toUpperCase()}] ${title}`,
        description
      });
    });
  });
}

/**
 * Main validation function that combines all checks and shows appropriate toast messages
 * @param nodes - Array of nodes in the workflow
 * @param edges - Array of edges connecting the nodes
 * @param toast - Toast function from useToast hook
 * @returns boolean indicating if validation passed
 */
export function validateWorkflowWithToast(
  nodes: any,
  edges: Edge[],
  toast: (options: any) => void
): boolean {
  
  const errors = validateWorkflow(nodes, edges);
  showValidationErrors(errors, toast);
  return errors.length === 0;
}

// =============================================================================
// EXPORT INDIVIDUAL CHECKERS FOR EXTENSIBILITY
// =============================================================================

/**
 * Export individual checker functions for potential use in other parts of the application
 */
export { NodeChecker, EdgeChecker, GeneralChecker };