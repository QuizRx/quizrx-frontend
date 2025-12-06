import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import { useMutation } from '@apollo/client';
import { UPDATE_PIPELINE_FLOW_MUTATION } from '../apollo/mutation/pipeline';
import { UpdatePipelineFlowInput } from '../types/api/pipeline';

// Utility function to recursively remove __typename from objects
const removeTypename = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== '__typename') {
        newObj[key] = removeTypename(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
};

interface ReactFlowState {
  // Chat state
  isChatOpen: boolean;
  
  // React Flow state
  nodes: Node[];
  edges: Edge[];
  pipelineId: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
}

interface ReactFlowActions {
  // Chat actions
  openChat: () => void;
  closeChat: () => void;
  
  // React Flow actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setPipelineId: (id: string | null) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  
  // Save action
  saveReactFlow: () => Promise<void>;
  setSaving: (saving: boolean) => void;
  setDirty: (dirty: boolean) => void;
  markAsClean: () => void;
}

export type ReactFlowStore = ReactFlowState & ReactFlowActions;

export const useReactFlowStore = create<ReactFlowStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      isChatOpen: false,
      nodes: [],
      edges: [],
      pipelineId: null,
      isSaving: false,
      lastSaved: null,
      isDirty: false,

      // Chat actions
      openChat: () => {
        set({ isChatOpen: true });
      },

      closeChat: () => {
        set({ isChatOpen: false });
      },

      // React Flow actions
      setNodes: (nodes: Node[]) => {
        set({ nodes, isDirty: true });
      },

      setEdges: (edges: Edge[]) => {
        set({ edges, isDirty: true });
      },

      setPipelineId: (id: string | null) => {
        set({ pipelineId: id });
      },

      updateNode: (nodeId: string, updates: Partial<Node>) => {
        const { nodes } = get();
        const updatedNodes = nodes.map(node => 
          node.id === nodeId ? { ...node, ...updates } : node
        );
        set({ nodes: updatedNodes, isDirty: true });
      },

      updateEdge: (edgeId: string, updates: Partial<Edge>) => {
        const { edges } = get();
        const updatedEdges = edges.map(edge => 
          edge.id === edgeId ? { ...edge, ...updates } : edge
        );
        set({ edges: updatedEdges, isDirty: true });
      },

      addNode: (node: Node) => {
        const { nodes } = get();
        set({ nodes: [...nodes, node], isDirty: true });
      },

      removeNode: (nodeId: string) => {
        const { nodes, edges } = get();
        const filteredNodes = nodes.filter(node => node.id !== nodeId);
        const filteredEdges = edges.filter(edge => 
          edge.source !== nodeId && edge.target !== nodeId
        );
        set({ nodes: filteredNodes, edges: filteredEdges, isDirty: true });
      },

      addEdge: (edge: Edge) => {
        const { edges } = get();
        set({ edges: [...edges, edge], isDirty: true });
      },

      removeEdge: (edgeId: string) => {
        const { edges } = get();
        const filteredEdges = edges.filter(edge => edge.id !== edgeId);
        set({ edges: filteredEdges, isDirty: true });
      },

      setSaving: (saving: boolean) => {
        set({ isSaving: saving });
      },

      setDirty: (dirty: boolean) => {
        set({ isDirty: dirty });
      },

      markAsClean: () => {
        set({ isDirty: false, lastSaved: new Date() });
      },

      // Save function placeholder - will be implemented with mutation hook
      saveReactFlow: async () => {
        const { nodes, edges, pipelineId } = get();
        console.log('canvas chat store');
        if (!pipelineId) {
          console.error('No pipeline ID available for saving');
          return;
        }

        set({ isSaving: true });
        
        try {
          // This will be implemented using the mutation hook in components
          console.log('Saving pipeline flow...', { nodes, edges, pipelineId });
          
          // Transform nodes and edges to match the expected format and remove __typename
          const transformedNodes = nodes.map(node => {
            const cleanNode = removeTypename(node);
            return {
              id: cleanNode.id,
              type: cleanNode.type || 'default',
              position: cleanNode.position,
              data: cleanNode.data,
              measured: cleanNode.measured,
              selected: cleanNode.selected,
              dragging: cleanNode.dragging,
            };
          });

          const transformedEdges = edges.map(edge => {
            const cleanEdge = removeTypename(edge);
            return {
              id: cleanEdge.id,
              source: cleanEdge.source,
              target: cleanEdge.target,
              sourceHandle: cleanEdge.sourceHandle === null ? undefined : cleanEdge.sourceHandle,
              targetHandle: cleanEdge.targetHandle === null ? undefined : cleanEdge.targetHandle,
              style: cleanEdge.style,
              animated: cleanEdge.animated,
              selected: cleanEdge.selected,
            };
          });

          const flowData: UpdatePipelineFlowInput = {
            nodes: transformedNodes,
            edges: transformedEdges,
          };

          // The actual mutation will be called from components that have access to Apollo Client
          console.log('Flow data prepared for saving:', flowData);
          
          set({ isDirty: false, lastSaved: new Date() });
        } catch (error) {
          console.error('Error saving pipeline flow:', error);
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    { name: 'react-flow-store' }
  )
);

// Custom hooks for easier access to frequently used values
export const useCanvasChat = () => {
  const store = useReactFlowStore();
  
  return {
    isChatOpen: store.isChatOpen,
    openChat: store.openChat,
    closeChat: store.closeChat,
  };
};

export const useCanvasFlow = () => {
  const store = useReactFlowStore();
  
  return {
    nodes: store.nodes,
    edges: store.edges,
    pipelineId: store.pipelineId,
    isSaving: store.isSaving,
    lastSaved: store.lastSaved,
    isDirty: store.isDirty,
    setNodes: store.setNodes,
    setEdges: store.setEdges,
    setPipelineId: store.setPipelineId,
    updateNode: store.updateNode,
    updateEdge: store.updateEdge,
    addNode: store.addNode,
    removeNode: store.removeNode,
    addEdge: store.addEdge,
    removeEdge: store.removeEdge,
    saveReactFlow: store.saveReactFlow,
    setSaving: store.setSaving,
    setDirty: store.setDirty,
    markAsClean: store.markAsClean,
  };
};

// Export the main store for direct access if needed
export default useReactFlowStore;
