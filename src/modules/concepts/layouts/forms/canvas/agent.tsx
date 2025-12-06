import { useState, useEffect } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, Bot, Type, History, Plus, Trash2, Settings } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";
import VariableUsageHelper from "../../../components/input-variables/variable-usage-helper";
import { InputVariable } from "@/modules/concepts/utils/objects/node-type-registry";

// Define the form data type (agent-specific data only, not including standard node properties)
type structuredOutput = {
  type: string;
  description: string;
}

interface AgentFormData {
  prompt: string;
  system_prompt: string;
  use_chat_history: boolean;
  use_structured_output?: boolean;
  structured_output?: Record<string, structuredOutput>;
}

const AgentForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();
    // Use the base form hook for standard node properties

  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  const existingFormData = (currentNode?.data?.formData as AgentFormData) || {} as AgentFormData;
  const [currentView, setCurrentView] = useState<'initial' | 'config'>('initial');
  
  // State for new structured output field
  const [newStructuredField, setNewStructuredField] = useState({
    name: '',
    type: 'string',
    description: ''
  });
    // Initialize form data with a function to ensure it uses the latest node data (agent-specific only)
  const [formData, setFormData] = useState(() => {
    const initialData = {
      prompt: existingFormData.prompt || '',
      system_prompt: existingFormData.system_prompt || '',
      use_chat_history: existingFormData.use_chat_history ?? true,
      use_structured_output: existingFormData.use_structured_output ?? false,
      structured_output: existingFormData.structured_output || {}
    };
    console.log('Initial formData:', initialData);
    return initialData;
  });  // Additional effect to handle initial load when nodeId becomes available
  useEffect(() => {
    if (nodeId && currentNode) {
      const nodeFormData = (currentNode.data?.formData as AgentFormData) || {};
        // Update agent-specific form data
      setFormData(prev => ({
        prompt: nodeFormData.prompt || prev.prompt,
        system_prompt: nodeFormData.system_prompt || prev.system_prompt,
        use_chat_history: nodeFormData.use_chat_history ?? prev.use_chat_history,
        use_structured_output: nodeFormData.use_structured_output ?? prev.use_structured_output,
        structured_output: nodeFormData.structured_output || prev.structured_output
      }));
    }
  }, [nodeId]);

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
                  }
                }
              : node
          )
        );
      }, 100); // Small debounce to avoid excessive updates

      return () => clearTimeout(timeoutId);
    }
  }, [formData, nodeId]);
  // Helper function to handle input changes for agent-specific form data
  const handleInputChange = (field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new structured output field
  const addStructuredField = () => {
    if (!newStructuredField.name) return;
    
    setFormData(prev => ({
      ...prev,
      structured_output: {
        ...prev.structured_output,
        [newStructuredField.name]: { 
          type: newStructuredField.type,
          description: newStructuredField.description 
        }
      }
    }));
    
    setNewStructuredField({ name: '', type: 'string', description: '' });
  };

  // Remove structured output field
  const removeStructuredField = (fieldName: string) => {
    setFormData(prev => {
      const { [fieldName]: removed, ...remainingFields } = prev.structured_output || {};
      return {
        ...prev,
        structured_output: remainingFields
      };
    });
  };

  const goToConfig = () => {
    setCurrentView('config');
  };

  const goBackToInitial = () => {
    setCurrentView('initial');
  };

  if (currentView === 'config') {
    return (
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={goBackToInitial}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Agent Details</span>
            </button>
          </div>          <div className="flex items-center gap-2 mb-4">
            <Bot className="text-purple-600" size={20} />
            <h2 className="text-lg font-semibold ">Agent Configuration</h2>
          </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">            <p className="text-sm text-purple-800">
              Configure your AI agent by defining the main prompt and system prompt that will guide its behavior and responses. The prompt defines the task, while the system prompt serves as the core instructions for how the agent should operate within your workflow.
            </p>
          </div>
        </div>        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 pb-8">
          <div className="space-y-6">
            {/* Prompt Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="text-purple-600" size={16} />
                <label className="block text-sm font-medium">Prompt</label>
              </div>
              <textarea
                value={formData.prompt}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                placeholder="Enter the main prompt or task for the agent..."
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
              />
              
              {/* Variable Usage Helper */}
              <VariableUsageHelper 
                inputVariables={currentNode?.data.input_variables as InputVariable[]|| []} 
                className="mt-2"
              />
              
              <p className="text-xs text-gray-500">
                This is the main prompt or task that defines what the agent should accomplish.
              </p>
            </div>

            {/* Chat History Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="text-purple-600" size={16} />
                <label className="block text-sm font-medium">Use Chat History</label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Allow the agent to access and use previous conversation history</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('use_chat_history', !formData.use_chat_history)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                    formData.use_chat_history ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.use_chat_history ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>            {/* System Prompt Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="text-purple-600" size={16} />
                <label className="block text-sm font-medium">System Prompt</label>
              </div>              <textarea
                value={formData.system_prompt}
                onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                placeholder="Enter system prompt to guide the agent's behavior and responses..."
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-none"
              />
              
              {/* Variable Usage Helper */}
              <VariableUsageHelper 
                inputVariables={currentNode?.data.input_variables as InputVariable[]|| []}
                className="mt-2"
              />
              
              <p className="text-xs text-gray-500">
                This prompt will guide the AI agent's behavior, personality, and how it responds to user inputs within your workflow.
              </p>
            </div>

            {/* Structured Output Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="text-purple-600" size={16} />
                <label className="block text-sm font-medium">Use Structured Output</label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable structured output format for consistent response structure</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('use_structured_output', !formData.use_structured_output)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
                    formData.use_structured_output ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.use_structured_output ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Structured Output Configuration */}
            {formData.use_structured_output && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-purple-600">
                    Output Structure Fields
                  </label>
                  <button
                    onClick={addStructuredField}
                    disabled={!newStructuredField.name}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 transition-colors text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Add Field
                  </button>
                </div>

                {/* Add new structured field */}
                <div className="grid grid-cols-1 gap-3 mb-3 p-3 rounded-md border border-purple-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Field Name</label>
                      <input
                        type="text"
                        value={newStructuredField.name}
                        onChange={(e) => setNewStructuredField(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., disease, symptom, diagnosis"
                        className="w-full px-2 py-1 border border-purple-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium  mb-1">Type</label>
                      <select
                        value={newStructuredField.type}
                        onChange={(e) => setNewStructuredField(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-2 py-1 border border-purple-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="integer">Integer</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={newStructuredField.description}
                      onChange={(e) => setNewStructuredField(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., The disease or condition being analyzed"
                      className="w-full px-2 py-1 border border-purple-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Existing structured fields */}
                <div className="space-y-2">
                  {Object.entries(formData.structured_output || {}).map(([name, field]: [string, any]) => (
                    <div key={name} className="p-3  border border-purple-200 rounded-md">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm text-purple-800">{name}</span>
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{field.type}</span>
                        </div>
                        <button
                          onClick={() => removeStructuredField(name)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove field"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium  mb-1">Type</label>
                          <select
                            value={field.type || 'string'}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                structured_output: {
                                  ...prev.structured_output,
                                  [name]: { ...field, type: e.target.value }
                                }
                              }));
                            }}
                            className="w-full px-2 py-1 border border-purple-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="integer">Integer</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">Description</label>
                        <input
                          type="text"
                          value={field.description || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              structured_output: {
                                ...prev.structured_output,
                                [name]: { ...field, description: e.target.value }
                              }
                            }));
                          }}
                          placeholder="Describe what this field represents"
                          className="w-full px-2 py-1 border border-purple-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {Object.keys(formData.structured_output || {}).length === 0 && (
                  <div className="text-center py-4 text-purple-600 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm">No structured output fields configured.</p>
                    <p className="text-xs mt-1">Add fields above to define the response structure.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <BaseNodeForm
      nodeTypeLabel="Agent"
      instructionText="Configure your AI agent by defining its core properties and behavior. This agent will serve as an intelligent component in your workflow, capable of processing inputs, executing tasks, and providing responses based on its configuration. Define the agent's system prompt to establish its personality, capabilities, and operational guidelines."      instructionIcon={<Bot className="h-5 w-5 text-purple-400" />}
      borderColor="border-purple-400"
      textColor="text-purple-800"
      backgroundColor="bg-purple-50"
      descriptionTextColor="text-purple-700"
    >
      {/* Agent Configuration Navigation */}
      <div className="bg-gray-50 p-4 rounded-md border">
        <div className="flex items-center justify-between">          <div>
            <h4 className="text-sm font-medium text-gray-800">Agent Configuration</h4>
            <p className="text-xs text-gray-500 mt-1">Configure prompt, system prompt, chat history, and structured output</p>
          </div><button
            onClick={goToConfig}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Configure 
            <ChevronRight size={16} />
          </button>
        </div>        {(formData.prompt || formData.system_prompt || formData.use_chat_history !== undefined || formData.use_structured_output) && (
          <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
            ✓ Agent configured: {formData.prompt ? 'prompt set' : 'no prompt'}, {formData.system_prompt ? 'system prompt set' : 'no system prompt'}, chat history {formData.use_chat_history ? 'enabled' : 'disabled'}, structured output {formData.use_structured_output ? `enabled (${Object.keys(formData.structured_output || {}).length} fields)` : 'disabled'}
          </div>
        )}
      </div>
    </BaseNodeForm>
  );
};

export default AgentForm;