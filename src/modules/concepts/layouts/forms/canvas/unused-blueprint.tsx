import { useState, useEffect, useCallback } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, FileText, Maximize2, Minimize2, Plus, Type } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";
import VariableUsageHelper from "../../../components/input-variables/variable-usage-helper";

// Define the form data type (blueprint-specific data only, not including standard node properties)
interface BlueprintFormData {
  workflowConfig: string;
  systemPrompt: string;
}

const BluePrintForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();    // Use the base form hook for standard node properties including input variables
  const {
    nodeName,
    nodeDescription,
    inputVariables,
  } = useBaseNodeForm();
  
  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  const nodeData = currentNode?.data || {};
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

  // Update node data whenever form data changes (with debouncing to avoid infinite loops)
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
                    // Keep standard node properties separate
                    name: nodeName || node.data.name,
                    description: nodeDescription || node.data.description,
                  }
                }
              : node
          )
        );
      }, 100); // Small debounce to avoid excessive updates

      return () => clearTimeout(timeoutId);
    }
  }, [formData, nodeName, nodeDescription, nodeId, setNodes]);
  const [promptBlocks, setPromptBlocks] = useState([
    { id: 1, title: "Role Definition", content: "" },
    { id: 2, title: "Context & Guidelines", content: "" },
    { id: 3, title: "Input/Output Format", content: "" }
  ]);
  // Helper function to handle input changes for blueprint-specific form data
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,    [field]: value
    }));
  };

  const goToSystemPrompt = () => {
    setCurrentView('systemPrompt');
  };

  const goBackToInitial = () => {
    setCurrentView('initial');
  };

  const toggleEditorExpand = () => {
    setIsEditorExpanded(!isEditorExpanded);
  };

  const addPromptBlock = () => {
    const newBlock = {
      id: Date.now(),
      title: `Section ${promptBlocks.length + 1}`,
      content: ""
    };
    setPromptBlocks([...promptBlocks, newBlock]);
  };

  const updatePromptBlock = (id: number, field: 'title' | 'content', value: string) => {
    setPromptBlocks(blocks => 
      blocks.map(block => 
        block.id === id ? { ...block, [field]: value } : block
      )
    );
    
    // Update the main system prompt with combined content
    const combinedPrompt = promptBlocks
      .map(block => `## ${block.title}\n${block.content}`)
      .join('\n\n');
    handleInputChange('systemPrompt', combinedPrompt);
  };

  const removePromptBlock = (id: number) => {
    if (promptBlocks.length > 1) {
      setPromptBlocks(blocks => blocks.filter(block => block.id !== id));
    }
  };

  if (currentView === 'systemPrompt') {
    return (
      <div className="grid gap-4 py-4 m-2">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={goBackToInitial}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to Blueprint</span>
          </button>
        </div>        {/* System Prompt View */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">System Prompt Configuration</h2>
          </div>
          
          {/* Variable Usage Helper */}
          <VariableUsageHelper inputVariables={inputVariables} />
          
          {/* <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <label className="block text-sm font-medium mb-2">
              Prompt Guidelines
            </label>
            <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600">
              <ul className="space-y-1">
                <li>• Be specific about the AI's role and responsibilities</li>
                <li>• Include context about the workflow's purpose</li>
                <li>• Define expected input and output formats</li>
                <li>• Specify any constraints or limitations</li>
                <li>• Include examples if helpful</li>
              </ul>
            </div>
          </div> */}

          {/* Expandable System Prompt Editor */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {/* <label className="block text-sm font-medium">
                Detailed System Prompt
                <span className="text-gray-500 ml-1">(Required)</span>
              </label> */}
              <div className="flex gap-2">
                <button
                  onClick={addPromptBlock}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Plus size={12} />
                  Add Section
                </button>
                <button
                  onClick={toggleEditorExpand}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  {isEditorExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                  {isEditorExpanded ? 'Minimize' : 'Expand'}
                </button>
              </div>
            </div>

            {/* Expandable Editor Container */}
            <div className={`
              transition-all duration-300 ease-in-out
              ${isEditorExpanded 
                ? 'fixed inset-0 z-50 bg-white p-6' 
                : 'relative'
              }
            `}>
              {isEditorExpanded && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Type className="text-blue-600" size={20} />
                    <h3 className="text-md font-semibold">System Prompt Editor</h3>
                  </div>
                  <button
                    onClick={toggleEditorExpand}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Minimize2 size={16} />
                    Exit Fullscreen
                  </button>
                </div>
              )}

              <div className={`
                space-y-4 
                ${isEditorExpanded 
                  ? 'h-full overflow-y-auto pb-20' 
                  : 'h-96 overflow-y-auto'
                }
              `}>
                {promptBlocks.map((block, index) => (
                  <div 
                    key={block.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => updatePromptBlock(block.id, 'title', e.target.value)}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1 flex-1"
                        placeholder="Section title..."
                      />
                      {promptBlocks.length > 1 && (
                        <button
                          onClick={() => removePromptBlock(block.id)}
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 hover:bg-red-50 rounded transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <textarea
                      value={block.content}
                      onChange={(e) => updatePromptBlock(block.id, 'content', e.target.value)}
                      placeholder={`Enter content for ${block.title.toLowerCase()}...`}
                      className={`
                        w-full px-3 py-3 border border-gray-300 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        resize-none font-mono text-sm leading-relaxed
                        ${isEditorExpanded ? 'h-32' : 'h-24'}
                      `}
                    />
                    
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Section {index + 1}</span>
                      <span>{block.content.length} characters</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom action bar for expanded mode */}
              {isEditorExpanded && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={addPromptBlock}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Section
                    </button>
                  </div>
                      <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Total: {promptBlocks.reduce((total, block) => total + block.content.length, 0)} characters
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>        </div>

        {/* No Save Button - auto-saves changes */}
      </div>
    );
  }  return (
    <BaseNodeForm
      nodeTypeLabel="Blueprint"
      instructionText="Configure your workflow blueprint by defining its name, description, and core structure. This blueprint will serve as the foundation for your workflow automation. After completing the basic setup, proceed to configure the system prompt and detailed AI instructions."
      instructionIcon={<FileText className="h-5 w-5 text-amber-400" />}
    >
      {/* System Prompt Navigation */}
      <div className="bg-gray-50 p-4 rounded-md border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-800">System Prompt</h4>
          </div>
          <button
            onClick={goToSystemPrompt}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Configure
            <ChevronRight size={16} />
          </button>
        </div>
        
        {formData.systemPrompt && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            ✓ System prompt configured ({formData.systemPrompt.length} characters)
          </div>
        )}
      </div>
    </BaseNodeForm>
  );
};

export default BluePrintForm;