import { useState, useEffect } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, Plus, X, Type, Route, History } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";
import VariableUsageHelper from "../../../components/input-variables/variable-usage-helper";
import { InputVariable } from "../../../utils/objects/node-type-registry";
// Define the form data type (router-specific data only, not including standard node properties)
export type RouterFormData = {
  system_prompt: string;
  use_chat_history: boolean;
  routes: {
    choice: string;
    target_agent: string;
    description: string;
    id?: string;
  }[];
}

const RouterForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();    // Use the base form hook for standard node properties
  
  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  const inputVariables = (currentNode?.data?.input_variables as InputVariable[]) || [];
  const existingFormData = (currentNode?.data?.formData as RouterFormData) || {} as RouterFormData;

  const [currentView, setCurrentView] = useState<'initial' | 'config'>('initial');  // Initialize form data with a function to ensure it uses the latest node data (router-specific only)
  const [formData, setFormData] = useState(() => {
    const initialData = {
      system_prompt: existingFormData.system_prompt || '',
      use_chat_history: existingFormData.use_chat_history ?? true,
      routes: existingFormData.routes || []
    };
    console.log('Initial formData:', initialData);
    return initialData;
  });

  // Additional effect to handle initial load when nodeId becomes available
  useEffect(() => {
    if (nodeId && currentNode) {
      const nodeFormData = (currentNode.data?.formData as RouterFormData) || {};
        // Update router-specific form data
      setFormData(prev => ({
        system_prompt: nodeFormData.system_prompt || prev.system_prompt,
        use_chat_history: nodeFormData.use_chat_history ?? prev.use_chat_history,
        routes: nodeFormData.routes || prev.routes,
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
    }  }, [formData, nodeId]);

  // Helper function to handle input changes for router-specific form data
  const handleInputChange = (field: keyof RouterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // Helper function to handle route changes
  const handleRouteChange = (index: number, field: 'choice' | 'target_agent' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      routes: prev.routes.map((route, i) => 
        i === index ? { ...route, [field]: value } : route
      )
    }));
  };  // Add new route
  const addRoute = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('Adding route...', formData.routes.length);
    setFormData(prev => {
      const newFormData = {
        ...prev,
        routes: [...prev.routes, { choice: '', target_agent: '', description: '', id: Date.now().toString() }]
      };
      return newFormData;
    });
  };

  // Remove route
  const removeRoute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index)
    }));
  };
  const goToConfig = () => {
    setCurrentView('config');
  };

  const goBackToInitial = () => {
    setCurrentView('initial');
  };  if (currentView === 'config') {
    return (
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={goBackToInitial}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Router Details</span>
            </button>
          </div>
        </div>        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 pb-8">
          <div className="space-y-6">          {/* Chat History Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="text-yellow-600" size={16} />
              <label className="block text-sm font-medium">Use Chat History</label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Allow the router to access and use previous conversation history</p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('use_chat_history', !formData.use_chat_history)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                  formData.use_chat_history ? 'bg-yellow-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.use_chat_history ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* System Prompt Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="text-yellow-600" size={16} />
              <label className="block text-sm font-medium">System Prompt</label>
            </div>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => handleInputChange('system_prompt', e.target.value)}
              placeholder="Enter system prompt to guide the routing decisions..."
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 h-32 resize-none"
            />
            <p className="text-xs text-gray-500">
              This prompt will guide the AI in determining which route to take based on the input.
            </p>
             <VariableUsageHelper 
                inputVariables={inputVariables} 
                className="mt-2"
              />
          </div>          {/* Routes Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="text-yellow-600" size={16} />
                <label className="block text-sm font-medium">Routes</label>
                <span className="text-xs text-gray-500">({formData.routes.length})</span>
              </div>
              <button
                type="button"
                onClick={addRoute}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition-colors"
              >
                <Plus size={12} />
                Add Route
              </button>
            </div>

            {formData.routes.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Route size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No routes configured yet. Click "Add Route" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.routes.map((route, index) => (
                  <div key={route.id || index} className="p-4  border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded text-xs font-bold text-yellow-700">
                        {index + 1}
                      </div>
                      <h4 className="text-sm font-medium">Route {index + 1}</h4>
                      <button
                        onClick={() => removeRoute(index)}
                        className="ml-auto p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Choice Name</label>
                        <input
                          type="text"
                          value={route.choice}
                          onChange={(e) => handleRouteChange(index, 'choice', e.target.value)}
                          placeholder="Enter choice name (e.g., 'support', 'billing', 'technical')"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={route.description}
                          onChange={(e) => handleRouteChange(index, 'description', e.target.value)}
                          placeholder="Describe when this route should be taken (e.g., 'When user needs help with account issues or billing problems')"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 h-20 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Describe the conditions or scenarios when this route should be selected.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Target Agent</label>
                        <input
                          type="text"
                          value={route.target_agent}
                          onChange={(e) => handleRouteChange(index, 'target_agent', e.target.value)}
                          placeholder="Target is set when connecting"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This field will be automatically populated when connecting to other agents.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Total routes configured: {formData.routes.length}
            </p>
          </div>
        </div>        {/* No Save Button - auto-saves changes */}
      </div>
      </div>
    );
  }

  return (
    <BaseNodeForm
      nodeTypeLabel="Router"
      instructionText="Configure your workflow router to intelligently direct data flow and control execution paths. This router acts as a decision-making hub, routing information between different workflow components based on conditions, rules, or logical branching. Define routing rules, conditional logic, and execution sequences to create dynamic and responsive workflow automation."
      instructionIcon={<Route className="h-5 w-5 text-yellow-400" />}
      borderColor="border-yellow-400"
      textColor="text-yellow-800"
      backgroundColor="bg-yellow-50"
      descriptionTextColor="text-yellow-700"
    >      {/* Router Configuration Navigation */}
      <div className="bg-gray-50 p-4 rounded-md border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-800">Router Configuration</h4>
            <p className="text-xs text-gray-500 mt-1">Configure system prompt and routing choices</p>
          </div>
          <button
            onClick={goToConfig}
            className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Configure 
            <ChevronRight size={16} />
          </button>
        </div>
          {formData.routes.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            ✓ Router configured: {formData.routes.length} routes, {formData.system_prompt ? 'system prompt set' : 'no system prompt'}, chat history {formData.use_chat_history ? 'enabled' : 'disabled'}
          </div>
        )}
      </div>
    </BaseNodeForm>
  );
};

export default RouterForm;