import { DragEvent, SetStateAction, useState, useEffect, useCallback } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, Blocks, Plus, X, Trash2, GripVertical, Play, Pause, RotateCcw, CheckCircle, Bot, Settings, Type, FileOutput } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";

// Define the form data type (sequence-specific data only, not including standard node properties)
interface SequenceFormData {
  sequenceType: string;
  triggerType: string;
  steps: any[];
  conditions: string;
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    delaySeconds: number;
  };
}

const SequencesForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();    // Use the base form hook for standard node properties including input variables
  const {
    nodeName,
    nodeDescription,
  } = useBaseNodeForm();
  
  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  const nodeData = currentNode?.data || {};
  const existingFormData = (currentNode?.data?.formData as SequenceFormData) || {} as SequenceFormData;

  const [currentView, setCurrentView] = useState<'initial' | 'sequenceConfig'>('initial');
  
  // Initialize form data with a function to ensure it uses the latest node data (sequence-specific only)
  const [formData, setFormData] = useState(() => ({
    sequenceType: existingFormData.sequenceType || 'linear',
    triggerType: existingFormData.triggerType || 'manual',
    steps: existingFormData.steps || [],
    conditions: existingFormData.conditions || '',    retryPolicy: existingFormData.retryPolicy || {
      enabled: false,
      maxRetries: 3,
      delaySeconds: 5
    }
  }));

  // Effect to sync form data when node data changes (important for initial load)
  useEffect(() => {
    if (currentNode?.data?.formData) {
      const nodeFormData = currentNode.data.formData as SequenceFormData;
      setFormData({
        sequenceType: nodeFormData.sequenceType || 'linear',
        triggerType: nodeFormData.triggerType || 'manual',
        steps: nodeFormData.steps || [],
        conditions: nodeFormData.conditions || '',
        retryPolicy: nodeFormData.retryPolicy || {
          enabled: false,
          maxRetries: 3,
          delaySeconds: 5
        }
      });
    }
  }, [currentNode?.data?.formData]);
  // Additional effect to handle initial load when nodeId becomes available
  useEffect(() => {
    if (nodeId && currentNode) {
      const nodeFormData = (currentNode.data?.formData as SequenceFormData) || {};
      
      // Update sequence-specific form data
      setFormData(prev => ({
        sequenceType: nodeFormData.sequenceType || prev.sequenceType,
        triggerType: nodeFormData.triggerType || prev.triggerType,
        steps: nodeFormData.steps || prev.steps,
        conditions: nodeFormData.conditions || prev.conditions,
        retryPolicy: nodeFormData.retryPolicy || prev.retryPolicy,
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

  const [availableSteps, setAvailableSteps] = useState([
    { id: 'step-1', type: 'agent', name: 'AI Agent Step', description: 'Execute an AI agent task', icon: Bot, enabled: false },
    { id: 'step-2', type: 'tool', name: 'Tool Execution', description: 'Run an external tool or API', icon: Settings, enabled: false },
    { id: 'step-3', type: 'input', name: 'Input Processing', description: 'Process user input data', icon: Type, enabled: false },
    { id: 'step-4', type: 'output', name: 'Output Generation', description: 'Generate final output', icon: FileOutput, enabled: false },
    { id: 'step-5', type: 'condition', name: 'Conditional Logic', description: 'Branch based on conditions', icon: CheckCircle, enabled: false },
    { id: 'step-6', type: 'loop', name: 'Loop Step', description: 'Repeat steps in a loop', icon: RotateCcw, enabled: false }
  ]);

  type SequenceStep = {
    id: string;
    type: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ size: number; className?: string }>;
    enabled: boolean;
    order?: number;
    config?: Record<string, any>;
  };
  
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([]);
  const [draggedStep, setDraggedStep] = useState<SequenceStep | null>(null);

  const sequenceTypes = [
    { value: 'linear', label: 'Linear Sequence', description: 'Steps execute one after another' },
    { value: 'parallel', label: 'Parallel Sequence', description: 'Steps execute simultaneously' },
    { value: 'conditional', label: 'Conditional Sequence', description: 'Steps execute based on conditions' }
  ];

  const triggerTypes = [
    { value: 'manual', label: 'Manual Trigger', description: 'Start sequence manually' },
    // { value: 'scheduled', label: 'Scheduled Trigger', description: 'Start on a schedule' },
    // { value: 'event', label: 'Event-based Trigger', description: 'Start on specific events' },
    // { value: 'webhook', label: 'Webhook Trigger', description: 'Start via webhook call' }
  ];
  // Helper function to handle input changes for sequence-specific form data
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  type FormDataKeys = keyof typeof formData;
  
  const handleNestedChange = (parent: FormDataKeys, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(typeof prev[parent] === 'object' && prev[parent] !== null ? prev[parent] : {}),
        [field]: value
      }    }));
  };

  const goToSequenceConfig = () => {
    setCurrentView('sequenceConfig');
  };

  const goBackToInitial = () => {
    setCurrentView('initial');
  };

  const addStepToSequence = (step:any) => {
    const newStep:any = {
      ...step,
      id: `${step.id}-${Date.now()}`,
      order: sequenceSteps.length + 1,
      config: {}
    };
    setSequenceSteps(prev => [...prev, newStep]);
  };

  const removeStepFromSequence = (stepId: string) => {
    setSequenceSteps(prev => prev.filter(step => step.id !== stepId));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, step: SequenceStep) => {
      setDraggedStep(step);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: { preventDefault: () => void; dataTransfer: { dropEffect: string; }; }) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (!draggedStep) return;

    const currentIndex = sequenceSteps.findIndex(step => step.id === draggedStep.id);
    if (currentIndex === -1) return;

    const newSteps = [...sequenceSteps];
    newSteps.splice(currentIndex, 1);
    newSteps.splice(targetIndex, 0, draggedStep);

    // Update order numbers
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));

    setSequenceSteps(updatedSteps);
    setDraggedStep(null);
  };

  const addCustomStep = () => {
    const stepName = prompt('Enter custom step name:');
    if (stepName) {
      const newStep = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        name: stepName,
        description: 'Custom step',
        icon: Play,
        enabled: true
      };
      addStepToSequence(newStep);
    }
  };

  if (currentView === 'sequenceConfig') {
    return (
      <div className="grid gap-4 py-4 m-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={goBackToInitial}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to Sequence Details</span>
          </button>
        </div>

        {/* Sequence Configuration View */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Blocks className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Sequence Configuration</h2>
          </div>
          
          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
            <p className="text-sm text-purple-800">
              Configure your sequence by defining the order of steps and their execution flow.
            </p>
          </div>

          {/* Sequence Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Blocks className="text-purple-600" size={16} />
              <label className="block text-sm font-medium">Sequence Type</label>
            </div>
            <div className="flex flex-col gap-2">
              {sequenceTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.sequenceType === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('sequenceType', type.value)}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Play className="text-green-600" size={16} />
              <label className="block text-sm font-medium">Trigger Type</label>
            </div>
            <div className="flex flex-col gap-2">
              {triggerTypes.map((trigger) => (
                <div
                  key={trigger.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.triggerType === trigger.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('triggerType', trigger.value)}
                >
                  <div className="font-medium text-sm">{trigger.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{trigger.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Builder */}
          <div className="space-y-4">
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="text-blue-600" size={16} />
                <label className="block text-sm font-medium">Sequence Steps</label>
              </div>
              <button
                onClick={addCustomStep}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              >
                <Plus size={12} />
                Add Custom Step
              </button>
            </div> */}

            {/* Available Steps */}
            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Available Steps</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableSteps.map((step) => {
                  const IconComponent = step.icon;
                  return (
                    <div
                      key={step.id}
                      className="p-2 bg-white border rounded cursor-pointer hover:border-blue-300 transition-colors"
                      onClick={() => addStepToSequence(step)}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent size={14} className="text-blue-600" />
                        <span className="text-xs font-medium">{step.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div> */}

            {/* Sequence Builder */}
            {/* <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px]"> */}
              {/* <h4 className="text-sm font-medium mb-3">Sequence Flow (Drag to reorder)</h4> */}
              
              {/* {sequenceSteps.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Blocks size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No steps added yet. Click on available steps above to add them.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sequenceSteps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <div
                        key={step.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, step)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-all"
                      >
                        <GripVertical size={16} className="text-gray-400" />
                        <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded text-xs font-bold text-purple-700">
                          {step.order}
                        </div>
                        <IconComponent size={16} className="text-purple-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.name}</div>
                          <div className="text-xs text-gray-600">{step.description}</div>
                        </div>
                        <button
                          onClick={() => removeStepFromSequence(step.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )} */}
            {/* </div> */}

            {/* <div className="text-xs text-gray-500">
              Steps in sequence: {sequenceSteps.length}
            </div> */}
          </div>

          {/* Retry Policy */}
          {/* <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="text-orange-600" size={16} />
              <label className="block text-sm font-medium">Retry Policy</label>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="checkbox" 
                id="retry-enabled" 
                checked={formData.retryPolicy.enabled}
                onChange={(e) => handleNestedChange('retryPolicy', 'enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600" 
              />
              <label htmlFor="retry-enabled" className="text-sm">Enable automatic retry on failure</label>
            </div> */}
{/* 
            {formData.retryPolicy.enabled && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Retries</label>
                  <input
                    type="number"
                    value={formData.retryPolicy.maxRetries}
                    onChange={(e) => handleNestedChange('retryPolicy', 'maxRetries', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Delay (seconds)</label>
                  <input
                    type="number"
                    value={formData.retryPolicy.delaySeconds}
                    onChange={(e) => handleNestedChange('retryPolicy', 'delaySeconds', parseInt(e.target.value))}
                    min="1"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )} */}
          {/* </div> */}        </div>

        {/* No Save Button - auto-saves changes */}
      </div>
    );
  }  return (
    <BaseNodeForm
      nodeTypeLabel="Sequence"
      instructionText="Configure your workflow sequence by defining its name, description, and execution order. This sequence will orchestrate the flow of multiple steps in your AI workflow. After completing the basic setup, proceed to configure advanced settings including sequence type, steps, and execution logic."
      instructionIcon={<Blocks className="h-5 w-5 text-purple-400" />}
    >
      {/* Sequence Configuration Navigation */}
      <div className="bg-gray-50 p-4 rounded-md border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-800">Sequence Configuration</h4>
          </div>
          <button
            onClick={goToSequenceConfig}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Configure 
            <ChevronRight size={16} />
          </button>
        </div>
        
        {sequenceSteps.length > 0 && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            ✓ Sequence configured: {sequenceSteps.length} steps, {sequenceTypes.find(t => t.value === formData.sequenceType)?.label}
          </div>
        )}
      </div>
    </BaseNodeForm>
  );
};

export default SequencesForm;