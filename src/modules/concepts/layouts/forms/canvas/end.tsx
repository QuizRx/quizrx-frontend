import { useState, useEffect, useCallback } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, FileText, Maximize2, Minimize2, Plus, Type, OctagonPause } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";

// Define the form data type (end-specific data only, not including standard node properties)
interface EndFormData {
  finalOutput: string;
  summaryText: string;
}

const EndForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();    // Use the base form hook for standard node properties including input variables
  const currentNode = nodeId ? getNode(nodeId) : null;
  const existingFormData = (currentNode?.data?.formData as EndFormData) || {} as EndFormData;

    // Initialize form data with a function to ensure it uses the latest node data (end-specific only)
  const [formData, setFormData] = useState(() => ({
    finalOutput: existingFormData.finalOutput || '',
    summaryText: existingFormData.summaryText || ''
  }));

  // Effect to sync form data when node data changes (important for initial load)
  useEffect(() => {
    if (currentNode?.data?.formData) {
      const nodeFormData = currentNode.data.formData as EndFormData;
      setFormData({
        finalOutput: nodeFormData.finalOutput || '',
        summaryText: nodeFormData.summaryText || ''
      });
    }
  }, [currentNode?.data?.formData]);
  // Additional effect to handle initial load when nodeId becomes available
  useEffect(() => {
    if (nodeId && currentNode) {
      const nodeFormData = (currentNode.data?.formData as EndFormData) || {};
      
      // Update end-specific form data
      setFormData(prev => ({
        finalOutput: nodeFormData.finalOutput || prev.finalOutput,
        summaryText: nodeFormData.summaryText || prev.summaryText,
      }));
    }
  }, [nodeId, currentNode]);

  useEffect(() => {
    if (nodeId) {
      const timeoutId = setTimeout(() => {
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    formData: formData,
                  }
                }
              : node
          )
        );
      }, 100); // Small debounce to avoid excessive updates

      return () => clearTimeout(timeoutId);
    }
  }, [formData, nodeId]);
    return (
    <BaseNodeForm
      nodeTypeLabel="End Node"
      instructionText="This is the end point of your workflow. Configure the final output and summary that will conclude the automation process. Define how your workflow ends and what final results or actions should be taken when the process completes."
      instructionIcon={<OctagonPause className="h-5 w-5 text-red-400" />}
      borderColor="border-red-400"
      textColor="text-red-800"
      backgroundColor="bg-red-50"
      descriptionTextColor="text-red-700"
    >
    </BaseNodeForm>
  );
};

export default EndForm;