"use client";

import {
  addEdge,
  Connection,
  Edge,
  getOutgoers,
  MarkerType,
  Node,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  XYPosition,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  NodeTypeRegistry,
  NodeTypeConfig,
  NodeTypes,
  generateUniqueId
} from "../objects/node-type-registry";
import { LucideIcon, Edit3, Check, X } from "lucide-react";
import { RouterFormData } from "../../layouts/forms/canvas/router";
import { handleConnection } from "../objects/node-connectivity";

// Define the type for our node data
interface NodeData {
  id: string;
  type: NodeTypes;
  name: string;
  description: string;
  Icon?: LucideIcon;
  form?: ReactNode;
  color?: string;
  isEditingName?: boolean;
  isEditingDescription?: boolean;
  [key: string]: any;
}

// Define our custom node type
export interface CustomNode extends Node {
  data: NodeData;
}

// Custom Node Component with Editable Fields
const EditableNode = ({ data, id }: { data: NodeData; id: string }) => {
  const [localName, setLocalName] = useState(data.name);
  const [localDescription, setLocalDescription] = useState(data.description);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const { setNodes } = useReactFlow();
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const updateNodeData = useCallback((updates: Partial<NodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [id, setNodes]);

  const handleNameEdit = useCallback(() => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, []);

  const handleDescriptionEdit = useCallback(() => {
    setIsEditingDescription(true);
    setTimeout(() => descriptionInputRef.current?.focus(), 0);
  }, []);

  const saveName = useCallback(() => {
    updateNodeData({ name: localName });
    setIsEditingName(false);
  }, [localName, updateNodeData]);

  const saveDescription = useCallback(() => {
    updateNodeData({ description: localDescription });
    setIsEditingDescription(false);
  }, [localDescription, updateNodeData]);

  const cancelNameEdit = useCallback(() => {
    setLocalName(data.name);
    setIsEditingName(false);
  }, [data.name]);

  const cancelDescriptionEdit = useCallback(() => {
    setLocalDescription(data.description);
    setIsEditingDescription(false);
  }, [data.description]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      cancelNameEdit();
    }
  }, [saveName, cancelNameEdit]);

  const handleDescriptionKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveDescription();
    } else if (e.key === 'Escape') {
      cancelDescriptionEdit();
    }
  }, [saveDescription, cancelDescriptionEdit]);

  // Update local state when data changes
  useEffect(() => {
    setLocalName(data.name);
    setLocalDescription(data.description);
  }, [data.name, data.description]);

  const IconComponent = data.Icon;

  return (
    <div className={`relative bg-white rounded-lg shadow-lg border-2 border-${data.color || 'gray-300'} min-w-[200px] max-w-[300px]`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500"
      />
      
      {/* Header with Icon and Type */}
      <div className={`bg-${data.color || 'gray-500'} text-white px-3 py-2 rounded-t-lg flex items-center gap-2`}>
        {IconComponent && <IconComponent size={16} />}
        <span className="text-sm font-medium uppercase tracking-wider">
          {data.type}
        </span>
      </div>

      {/* Node Content */}
      <div className="p-4 space-y-3">
        {/* Editable Name Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Name
            </label>
            {!isEditingName && (
              <button
                onClick={handleNameEdit}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Edit name"
              >
                <Edit3 size={12} className="text-gray-400" />
              </button>
            )}
          </div>
          
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={saveName}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter name..."
              />
              <button
                onClick={saveName}
                className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                title="Save"
              >
                <Check size={12} />
              </button>
              <button
                onClick={cancelNameEdit}
                className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div 
              onClick={handleNameEdit}
              className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors min-h-[24px] flex items-center"
            >
              {data.name || "Click to add name..."}
            </div>
          )}
        </div>

        {/* Editable Description Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Description
            </label>
            {!isEditingDescription && (
              <button
                onClick={handleDescriptionEdit}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Edit description"
              >
                <Edit3 size={12} className="text-gray-400" />
              </button>
            )}
          </div>
          
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                ref={descriptionInputRef}
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Enter description..."
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Ctrl+Enter to save</span>
                <div className="flex gap-1">
                  <button
                    onClick={saveDescription}
                    className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                    title="Save"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={cancelDescriptionEdit}
                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                    title="Cancel"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={handleDescriptionEdit}
              className="text-xs text-gray-600 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors min-h-[32px] flex items-start"
            >
              {data.description || "Click to add description..."}
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500"
      />
    </div>
  );
};

// Define node types
export const NODE_TYPES = {
  DEFAULT: "editableNode",
  // Add more node types in the future if needed
};

// Register the custom node component
// Removed duplicate export of nodeTypes
const nodeTypes = {
  editableNode: EditableNode,
};

// Edge style constants
export const EDGE_STYLES = {
  DEFAULT: {
    stroke: "#3B82F6", // blue-500
    strokeWidth: 4,
  },
  MARKER: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: "#3B82F6", // blue-500
  },
};

const useNodeManagement = (initialNodes?: CustomNode[], initialEdges?: Edge[]) => {
  const defaultNodes: CustomNode[] = initialNodes || [];
  const defaultEdges: Edge[] = initialEdges || [];
  
  const [nodes, setNodes, onNodesChange] =
    useNodesState<CustomNode>(defaultNodes);  const [edges, setEdges, originalOnEdgesChange] = useEdgesState<Edge>(
      defaultEdges
  );

  // Update nodes and edges when initial data changes
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges && initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  // Custom onEdgesChange handler that also handles router target_agent clearing
  const onEdgesChange = useCallback((changes: any[]) => {
    // Handle edge deletions to clear router target_agent
    changes.forEach((change) => {
      if (change.type === 'remove') {
        const edgeToRemove = edges.find(edge => edge.id === change.id);
        if (edgeToRemove?.sourceHandle?.startsWith('choice-')) {
          // This is a router choice connection being removed
          const choiceIndex = parseInt(edgeToRemove.sourceHandle.replace('choice-', ''));
          
          setNodes((nodes) =>
            nodes.map((node) => {
              if (node.id === edgeToRemove.source) {
                const formData = node.data?.formData || { system_prompt: '', routes: [] };
                const updatedRoutes = [...(formData.routes || [])];
                
                if (updatedRoutes[choiceIndex]) {
                  updatedRoutes[choiceIndex] = {
                    ...updatedRoutes[choiceIndex],
                    target_agent: ''
                  };
                }
                
                return {
                  ...node,
                  data: {
                    ...node.data,
                    formData: {
                      ...formData,
                      routes: updatedRoutes
                    }
                  }
                };
              }
              return node;
            })
          );
        }
      }
    });

    // Apply the original edge changes
    originalOnEdgesChange(changes);
  }, [edges, originalOnEdgesChange, setNodes]);
  const reactFlowInstance = useReactFlow();

  const checkCollision = useCallback(
    (newNodePosition: XYPosition, nodes: CustomNode[]) => {
      const MIN_DISTANCE = 50;
      for (const node of nodes) {
        const dx = newNodePosition.x - node.position.x;
        const dy = newNodePosition.y - node.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < MIN_DISTANCE) {
          return true;
        }
      }
      return false;
    },
    []
  );

  const createNewNode = useCallback(
    (
      nodeType: NodeTypes,
      nodeData?: Partial<NodeTypeConfig>,
      position?: XYPosition
    ) => {
      console.log("Creating new node:", nodeType, nodeData, position);
      try {
        // Generate a unique ID for the new node
        const id = `${nodeType}-${Date.now()}`;

        // Set position or randomize if not provided
        let nodePosition = position || {
          x: Math.random() * 300 + 50,
          y: Math.random() * 300 + 50,
        };

        // Adjust position if it collides with existing nodes
        while (checkCollision(nodePosition, nodes)) {
          nodePosition = {
            x: Math.random() * 300 + 50,
            y: Math.random() * 300 + 50,
          };
        }

        // Get node config from registry or use provided data
        const nodeConfig = nodeData || NodeTypeRegistry[nodeType];

        if (!nodeConfig) {
          console.error(`Node type '${nodeType}' not found in registry`);
          return;
        }        // Create the new node with all required data
        const newNode: CustomNode = {
          id,
          type: NODE_TYPES.DEFAULT,
          position: nodePosition,
          data: {
            id: generateUniqueId(nodeType),
            type: nodeType,
            name: nodeConfig.name || "Unnamed Node",
            description: nodeConfig.description || "new description",
            formData: nodeConfig.defaultFormData || {},
            ...nodeConfig,
          },
        };

        setNodes((nds) => [...nds, newNode]);
      } catch (error) {
        console.error("Error adding new node:", error);
      }
    },
    [setNodes, nodes, checkCollision]
  );

  const updateNodeData = useCallback(
    (nodeId: string, updates: Partial<NodeData>) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    },
    [setNodes]
  );

  useEffect(() => {
    const handleAddNode = (
      event: CustomEvent<{
        nodeType: NodeTypes;
        nodeData?: Partial<NodeTypeConfig>;
      }>
    ) => {
      const { nodeType, nodeData } = event.detail;
      createNewNode(nodeType, nodeData);
    };
    document.addEventListener("addNode", handleAddNode as EventListener);
    return () => {
      document.removeEventListener("addNode", handleAddNode as EventListener);
    };
  }, [createNewNode]);
  const onConnect = useCallback(
    (connection: Connection) => {
      // Create edge without arrow marker
      const newEdge = {
        ...connection,
        style: EDGE_STYLES.DEFAULT,
        animated: true,
      };

      setEdges((eds: Edge[]) => addEdge(newEdge, eds));

      // Handle router target_agent updates
      const nodes = reactFlowInstance.getNodes() as CustomNode[];
      const sourceNode = nodes.find((node) => node.id === connection.source);
      
      if (sourceNode?.data?.type === 'router' && connection.sourceHandle?.startsWith('choice-')) {
        // Extract the choice index from the handle ID
        const choiceIndex = parseInt(connection.sourceHandle.replace('choice-', ''));
        
        // Update the router node's target_agent for this choice
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === connection.source) {
              const formData = node.data?.formData || { system_prompt: '', routes: [] };
              const updatedRoutes = [...(formData.routes || [])];
              
              if (updatedRoutes[choiceIndex]) {
                updatedRoutes[choiceIndex] = {
                  ...updatedRoutes[choiceIndex],
                  target_agent: connection.target || ''
                };
              }
              
              return {
                ...node,
                data: {
                  ...node.data,
                  formData: {
                    ...formData,
                    routes: updatedRoutes
                  }
                }
              };
            }
            return node;
          })
        );
      }
    },
    [setEdges, setNodes, reactFlowInstance]
  );  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const nodes = reactFlowInstance.getNodes() as CustomNode[];
      const edges = reactFlowInstance.getEdges() as Edge[];
      
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      
      // Prevent self-connection
      if (connection.target === connection.source) return false;
      
      if (!sourceNode || !targetNode) return false;
        const sourceType = sourceNode.data.type;
      const targetType = targetNode.data.type;
      const sourceHandle = connection.sourceHandle || undefined;
      const targetHandle = connection.targetHandle || undefined;
      console.log("Validating connection:", {
        sourceType,
        targetType,
        sourceHandle,
        targetHandle,
        targetNodeId: connection.target,
        edges
      });
      // Use the extracted validation function
      return handleConnection[sourceType]({
        sourceType,
        targetType,
        sourceHandle,
        targetHandle,
        targetNodeId: connection.target,
        edges
      });
    },
    [reactFlowInstance]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    createNewNode,
    updateNodeData,
    reactFlowInstance,
    setNodes,
    setEdges,
  };
};

const useDragAndDrop = (createNewNode: Function, reactFlowInstance: any) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      // Get position in the flow where the element is dropped
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      try {
        // Try to get data from our specific MIME type first
        const jsonData = event.dataTransfer.getData("application/reactflow");

        if (!jsonData) {
          console.warn("No valid data found in drag event");
          return;
        }

        const dragData = JSON.parse(jsonData);
        const nodeType = dragData.type as NodeTypes;

        // Create new node using the node type
        createNewNode(nodeType, null, position);
      } catch (error) {
        console.error("Error adding new node:", error);
      }
    },
    [createNewNode, reactFlowInstance]
  );

  return { isDragging, onDragOver, onDragLeave, onDrop };
};

const useEdgeReconnection = (setEdges: Function) => {
  const edgeReconnectSuccessful = useRef(true);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;

      // Apply styling to reconnected edge without arrow marker
      const updatedConnection = {
        ...newConnection,
        style: EDGE_STYLES.DEFAULT,
        animated: true,
      };

      //@ts-ignore
      setEdges((els) => reconnectEdge(oldEdge, updatedConnection, els));
    },
    [setEdges]
  );

  const onReconnectEnd = useCallback(
    (_: any, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds: any) => eds.filter((e: any) => e.id !== edge.id));
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges]
  );

  return { onReconnectStart, onReconnect, onReconnectEnd };
};

export { useNodeManagement, useDragAndDrop, useEdgeReconnection, nodeTypes };