import { useState, useEffect, useCallback, ReactNode } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import InputVariablesManager from "../../../components/input-variables/input-variables-manager";
import { InputVariable } from "../../../utils/objects/node-type-registry";

interface BaseNodeFormProps {
  children?: ReactNode;
  nodeTypeLabel?: string;
  instructionText?: string;
  instructionIcon?: ReactNode;
  className?: string;
  borderColor?: string;
  textColor?: string;
  backgroundColor?: string;
  descriptionTextColor?: string;
}

interface UseBaseNodeFormReturn {
  nodeName: string;
  nodeDescription: string;
  inputVariables: InputVariable[];
  setNodeName: (name: string) => void;
  setNodeDescription: (description: string) => void;
  setInputVariables: (variables: InputVariable[]) => void;
  updateNodeData: (updates: { name?: string; description?: string; input_variables?: InputVariable[] }) => void;
}

// Custom hook to handle base node form logic
export const useBaseNodeForm = (): UseBaseNodeFormReturn => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();
  
  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  
  // Separate state for standard node properties
  const [nodeName, setNodeName] = useState<string>('');
  const [nodeDescription, setNodeDescription] = useState<string>('');
  const [inputVariables, setInputVariables] = useState<InputVariable[]>([]);
  
  // Additional effect to handle initial load when nodeId becomes available
  useEffect(() => {
    if (nodeId && currentNode) {
      console.log('got new variables for nodeId:', nodeId, currentNode.data);
      setNodeName((currentNode.data.name as string) || '');
      setNodeDescription((currentNode.data.description as string) || '');
      setInputVariables((currentNode.data.input_variables as InputVariable[]) || []);
    }
  }, [nodeId]);
  // Create an updateNodeData function to handle standard node property updates
  const updateNodeData = useCallback((updates: { name?: string; description?: string; input_variables?: InputVariable[] }) => {
    if (nodeId) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    }
  }, [nodeId]);
  // Auto-save name changes
  useEffect(() => {
    if (nodeId && nodeName !== (currentNode?.data?.name as string)) {
      const timeoutId = setTimeout(() => {
        updateNodeData({ name: nodeName });
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [nodeName]);

  // Auto-save description changes
  useEffect(() => {
    if (nodeId && nodeDescription !== (currentNode?.data?.description as string)) {
      const timeoutId = setTimeout(() => {
        updateNodeData({ description: nodeDescription });
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [nodeDescription]);

  // Auto-save input variables changes
  useEffect(() => {
    if (nodeId && JSON.stringify(inputVariables) !== JSON.stringify(currentNode?.data?.input_variables || [])) {
      const timeoutId = setTimeout(() => {
        updateNodeData({ input_variables: inputVariables });
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [inputVariables]);

  return {
    nodeName,
    nodeDescription,
    inputVariables,
    setNodeName,
    setNodeDescription,
    setInputVariables,
    updateNodeData
  };
};

// Base form component for standard name and description inputs
const BaseNodeForm: React.FC<BaseNodeFormProps> = ({
  children,
  nodeTypeLabel = "Node",
  instructionText,
  instructionIcon,
  className = "",
  borderColor = "border-purple-400",
  textColor = "text-purple-800",
  backgroundColor = "bg-purple-50",
  descriptionTextColor = "text-purple-700"
}) => {  const nodeId = useNodeId();
  const { getNode } = useReactFlow();
  const currentNode = nodeId ? getNode(nodeId) : null;
  const nodeType = (currentNode?.data?.type as string) || 'unknown';

  const {
    nodeName,
    nodeDescription,
    inputVariables,
    setNodeName,
    setNodeDescription,
    setInputVariables
  } = useBaseNodeForm();

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Fixed Header with Instructions */}
      {instructionText && (
        <div className={`flex-shrink-0 ${backgroundColor} border-l-4 ${borderColor} p-4 m-6 mb-4`}>
          <div className="flex items-start">
            {instructionIcon && (
              <div className="flex-shrink-0">
                {instructionIcon}
              </div>
            )}
            <div className={instructionIcon ? "ml-3" : ""}>
              <h3 className={`text-sm font-medium ${textColor}`}>{nodeTypeLabel} Configuration Instructions</h3>
              <div className={`mt-1 text-sm ${descriptionTextColor}`}>
                {instructionText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className={`grid gap-4 ${className}`}>
          {/* Standard Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {nodeTypeLabel} Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder={`Enter ${nodeTypeLabel.toLowerCase()} name`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={nodeDescription}
                onChange={(e) => setNodeDescription(e.target.value)}
                placeholder={`An intelligent ${nodeTypeLabel.toLowerCase()} to process tasks within your workflow`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              />
            </div>

            {/* Input Variables Section */}
            <InputVariablesManager
              inputVariables={inputVariables}
              onInputVariablesChange={setInputVariables}
              nodeType={nodeType}
            />

            {/* Custom content for specific forms */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseNodeForm;
