"use client";

import React, { useEffect } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  NODE_TYPES,
  useDragAndDrop,
  useEdgeReconnection,
  useNodeManagement,
} from "../../utils/helpers/canvas";
import { ZoomSlider } from "@/core/components/ui/zoom-slider";
import BaseNodeWithHeader from "../../components/canvas/custom-node";
import ChatRun from "./chat-run";
import { useCanvasChat, useCanvasFlow } from "../../store/react-flow-store";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_ALL_PIPELINE_INFO } from "@/modules/concepts/apollo/query/pipeline";
// Chat wrapper component that can access React Flow context
const ChatWrapper = () => {
  const { isChatOpen, openChat, closeChat } = useCanvasChat();

  return (
    <ChatRun 
      isOpen={isChatOpen} 
      onToggle={isChatOpen ? closeChat : openChat}
    />
  );
};

const ReactFlowCanvas = () => {
  const params = useParams();
  const pipelineId = params.id as string;
  const { setPipelineId } = useCanvasFlow();
  
  // Fetch pipeline data
  const { data, loading: pipelineLoading, error: pipelineError } = useQuery(GET_ALL_PIPELINE_INFO, {
      variables: { getPipelineByIdId: pipelineId! },
      skip: !pipelineId,
      errorPolicy: 'all'
    });
  
  const pipelineNodes = data?.getPipelineById?.nodes || [];
  const pipelineEdges = data?.getPipelineById?.edges || [];
    // Initialize store with pipeline ID
  useEffect(() => {
    if (pipelineId) {
      console.log('Setting pipeline ID in store:', pipelineId);
      setPipelineId(pipelineId);
    }
  }, [pipelineId]); // Removed setPipelineId from dependencies
    const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    createNewNode,
    reactFlowInstance,
    setEdges,
  } = useNodeManagement(pipelineNodes, pipelineEdges);  // Sync current nodes and edges with store for saving (with debouncing to avoid excessive updates)
  const { setNodes: setStoreNodes, setEdges: setStoreEdges } = useCanvasFlow();
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStoreNodes(nodes);
    }, 300); // Debounce for 300ms
    
    return () => clearTimeout(timeoutId);
  }, [nodes]); // Removed setStoreNodes from dependencies
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStoreEdges(edges);
    }, 300); // Debounce for 300ms
    
    return () => clearTimeout(timeoutId);
  }, [edges]); // Removed setStoreEdges from dependencies


  const { isDragging, onDragOver, onDragLeave, onDrop } = useDragAndDrop(
    createNewNode,
    reactFlowInstance
  );

  const { onReconnectStart, onReconnect, onReconnectEnd } =
    useEdgeReconnection(setEdges);

  // Define the nodeTypes with the correct component
  const nodeTypes = {
    [NODE_TYPES.DEFAULT]: BaseNodeWithHeader,

  };  // Edge defaults with arrow marker - explicitly defining the markerEnd
  const defaultEdgeOptions = {
    style: { stroke: "#9375FA", strokeWidth: 4 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 10,
      height: 10,
      color: "#9375FA",
    },
  };


  // Show loading state while fetching pipeline data
  if (pipelineLoading) {
    return (
      <div className="w-full h-[95vh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (pipelineError && pipelineId) {
    return (
      <div className="w-full h-[95vh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-red-600">Error loading pipeline: {pipelineError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-[95vh] z-[-1] transition-colors duration-300 ${
        isDragging ? "bg-primary/5" : ""
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        nodeTypes={nodeTypes}
        fitView
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        connectionLineType={ConnectionLineType.Bezier}
        isValidConnection={isValidConnection}
        connectionLineStyle={{ stroke: "#9375FA", strokeWidth: 4 }}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        selectionOnDrag
        panOnScroll
        snapToGrid
        snapGrid={[15, 15]}
        // defaultEdgeOptions={defaultEdgeOptions}
      >
        <ZoomSlider position="top-left" />
        {/* <MiniMap
          position="bottom-left"
          className="rounded-md border border-border shadow-md"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }}
          nodeColor="var(--primary)"
          maskColor="rgba(0, 0, 0, 0.2)"
          nodeBorderRadius={2}
          nodeStrokeWidth={3}
          nodeStrokeColor="var(--background)"        /> */}        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <h1>nodes</h1>
      <pre>{JSON.stringify(nodes, null, 5)}</pre>
      
      <h1>edges</h1>  
      <pre>{JSON.stringify(edges, null, 2)}</pre>

      <ChatWrapper />
    </div>
  );
};

const ReactFlowLayoutCanvas = () => {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvas />
    </ReactFlowProvider>
  );
};

export default ReactFlowLayoutCanvas;
