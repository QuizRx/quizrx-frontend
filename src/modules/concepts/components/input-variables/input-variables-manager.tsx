import React, { useState, useCallback, useEffect } from 'react';
import { useReactFlow, useNodeId } from '@xyflow/react';
import { Plus, Trash2, Info, Variable, ArrowLeft, ArrowRight } from 'lucide-react';
import { InputVariable } from '../../utils/objects/node-type-registry';

interface InputVariablesManagerProps {
  inputVariables: InputVariable[];
  onInputVariablesChange: (variables: InputVariable[]) => void;
  nodeType: string;
  className?: string;
}

const InputVariablesManager: React.FC<InputVariablesManagerProps> = ({
  inputVariables,
  onInputVariablesChange,
  nodeType,
  className = ""
}) => {
  const { getNodes } = useReactFlow();
  const currentNodeId = useNodeId();
  
  
  // Get available source nodes and their output variables
  const getAvailableSources = useCallback(() => {
    const allNodes = getNodes();
    const availableSources: Array<{ nodeId: string; nodeName: string; variables: string[] }> = [];
    
    // Add system variables (always available)
    if (nodeType !== 'start') {
      availableSources.push({
        nodeId: 'system',
        nodeName: 'System',
        variables: ['user_message']
      });
    }
    
    // Find nodes that can provide output (agents and start node)
    allNodes.forEach(node => {
      // Skip current node and nodes that don't produce output
      if (node.id === currentNodeId || 
          !node.data?.type ||
          ['router', 'end', 'api', 'vector_retriever', 'graph_retriever'].includes(node.data.type as string)) {
        return;
      }
      
      const variables: string[] = [];
      
      if (node.data.type === 'start') {

      } else if (node.data.type === 'agent') {
        const formData = node.data.formData || {};
        
        // Check if agent has structured output
        if ((formData as any).use_structured_output && (formData as any).structured_output) {
          Object.keys((formData as any).structured_output).forEach(key => {
            variables.push(key);
          });
        } else {
          // Default response variable for agents without structured output
          variables.push('response');
        }
      }
      
      if (variables.length > 0) {
        availableSources.push({
          nodeId: node.id,
          nodeName: (node.data.name as string) || 'Unnamed Node',
          variables
        });
      }
    });
    return availableSources;
  }, [currentNodeId, nodeType]);

  const [availableSources, setAvailableSources] = useState(getAvailableSources());
  
  // Update available sources when nodes change
  useEffect(() => {
    setAvailableSources(getAvailableSources());
  }, [getAvailableSources]);

  const addInputVariable = useCallback(() => {
    const newVariable: InputVariable = {
      coming_node: '',
      variable: '',
      name: ''
    };
    onInputVariablesChange([...inputVariables, newVariable]);
  }, [inputVariables]);

  const removeInputVariable = useCallback((index: number) => {
    const newVariables = inputVariables.filter((_, i) => i !== index);
    onInputVariablesChange(newVariables);
  }, [inputVariables]);

  const updateInputVariable = useCallback((index: number, field: keyof InputVariable, value: string) => {
    const newVariables = [...inputVariables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    
    // Auto-generate name if coming_node and variable are selected
    if (field === 'coming_node' || field === 'variable') {
      const variable = newVariables[index];
      if (variable.coming_node && variable.variable) {
        const sourceName = availableSources.find(s => s.nodeId === variable.coming_node)?.nodeName || variable.coming_node;
        variable.name = `${sourceName.toLowerCase().replace(/\s+/g, '_')}_${variable.variable}`;
      }
    }
    
    onInputVariablesChange(newVariables);
  }, [inputVariables, onInputVariablesChange, availableSources]);

  const getVariablesForNode = useCallback((nodeId: string) => {
    const source = availableSources.find(s => s.nodeId === nodeId);
    return source ? source.variables : [];
  }, [availableSources]);

  // Special handling for start node - it should only have system.user_message
  if (nodeType === 'start') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Start Node Variables</h3>
              <div className="mt-1 text-sm text-green-700">
                The start node automatically provides <code className="bg-green-100 px-1 rounded">system.user_message</code> as the initial input for your workflow.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with explanation */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-start">
          <Variable className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Input Variables Configuration</h3>
            <div className="mt-1 text-sm text-blue-700">
              Configure which variables from previous nodes you want to access in this node. 
              Use <code className="bg-blue-100 px-1 rounded">{"{{variable_name}}"}</code> in your prompts to reference these variables.
            </div>
          </div>
        </div>
      </div>

      {/* Input Variables List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">Input Variables</label>
          <button
            type="button"
            onClick={addInputVariable}
            className="flex items-center gap-1 text-sm text-primary font-medium cursor-pointer"
          >
            <Plus size={14} />
            Add Variable
          </button>
        </div>

        {inputVariables.length === 0 ? (
          <div className="text-center py-6 border border-gray-200 rounded-md">
            <Variable className="h-8 w-8 mx-auto mb-2 text-red-400 " />
            <p className="text-sm">No input variables configured</p>
            <p className="text-xs mt-1">Click "Add Variable" to start using outputs from previous nodes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inputVariables.map((variable, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border border-gray-200 rounded-md">
                {/* Source Node */}
                <div className="col-span-4">
                  <label className="block text-xs font-medium  mb-1">Source Node</label>
                  <select
                    value={variable.coming_node}
                    onChange={(e) => updateInputVariable(index, 'coming_node', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select source...</option>
                    {availableSources.map(source => (
                      <option key={source.nodeId} value={source.nodeId}>
                        {source.nodeName} ({source.nodeId === 'system' ? 'System' : source.nodeId.split('-')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variable */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium mb-1">Variable</label>
                  <select
                    value={variable.variable}
                    onChange={(e) => updateInputVariable(index, 'variable', e.target.value)}
                    disabled={!variable.coming_node}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select variable...</option>
                    {getVariablesForNode(variable.coming_node).map(varName => (
                      <option key={varName} value={varName}>
                        {varName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="col-span-4">
                  <label className="block text-xs font-medium mb-1">Variable Name</label>
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) => updateInputVariable(index, 'name', e.target.value)}
                    placeholder="my_variable_name"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Remove Button */}
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeInputVariable(index)}
                    className="w-full p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Usage example */}
                {variable.name && (
                  <div className="col-span-12 mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Use in prompts: <code className="bg-gray-100 px-1 rounded">{"{{" + variable.name + "}}"}</code>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      {inputVariables.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-amber-800 mb-2">How to use these variables:</h4>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Use <code className="bg-amber-100 px-1 rounded">{"{{variable_name}}"}</code> syntax in your system prompts</li>
            <li>• Variables are replaced with actual values when the workflow runs</li>
            <li>• Variable names should be unique and use only letters, numbers, and underscores</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default InputVariablesManager;
