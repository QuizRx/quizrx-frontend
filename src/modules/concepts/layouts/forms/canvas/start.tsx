import { useState, useEffect, useCallback } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, FileText, Maximize2, Minimize2, Plus, Type, Play } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";
import VariableUsageHelper from "../../../components/input-variables/variable-usage-helper";

// Define the form data type (blueprint-specific data only, not including standard node properties)
interface BlueprintFormData {
  workflowConfig: string;
  systemPrompt: string;
}

const StartForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();    // Use the base form hook for standard node properties including input variables
  const {
  } = useBaseNodeForm();
  
  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  const existingFormData = (currentNode?.data?.formData as BlueprintFormData) || {} as BlueprintFormData;

  const [currentView, setCurrentView] = useState<'initial' | 'systemPrompt'>('initial');
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
    // Initialize form data with a function to ensure it uses the latest node data (blueprint-specific only)
  const [formData, setFormData] = useState(() => ({
    workflowConfig: existingFormData.workflowConfig || '',
    systemPrompt: existingFormData.systemPrompt || ''
  }));

  // Effect to sync form data when node data changes (important for initial load)
  useEffect(() => {
    if (currentNode?.data?.formData) {
      const nodeFormData = currentNode.data.formData as BlueprintFormData;
      setFormData({
        workflowConfig: nodeFormData.workflowConfig || '',
        systemPrompt: nodeFormData.systemPrompt || ''
      });
    }
  }, [currentNode?.data?.formData]);
  // Additional effect to handle initial load when nodeId becomes available
  useEffect(() => {
    if (nodeId && currentNode) {
      const nodeFormData = (currentNode.data?.formData as BlueprintFormData) || {};
      
      // Update blueprint-specific form data
      setFormData(prev => ({
        workflowConfig: nodeFormData.workflowConfig || prev.workflowConfig,
        systemPrompt: nodeFormData.systemPrompt || prev.systemPrompt,
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
  }, [formData, nodeId]);  return (
    <BaseNodeForm
      nodeTypeLabel="Start Node"
      instructionText="This is the starting point of your workflow. Configure the initial parameters and system prompts that will guide the entire automation process. Define how your workflow begins and set up the foundational elements that subsequent nodes will build upon."
      instructionIcon={<Play className="h-5 w-5 text-green-400" />}
      borderColor="border-green-400"
      textColor="text-green-800"
      backgroundColor="bg-green-50"
      descriptionTextColor="text-green-700"
    >
    </BaseNodeForm>
  );
};

export default StartForm;