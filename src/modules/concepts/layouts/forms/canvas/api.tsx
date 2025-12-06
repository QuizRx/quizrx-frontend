import { useState, useEffect, useCallback } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, Globe, Plus, Trash2, Play, Code } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";
import VariableUsageHelper from "../../../components/input-variables/variable-usage-helper";
import { InputVariable } from "../../../utils/objects/node-type-registry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";

// Define the ApiTool interface directly in this file
export interface apiFormData {
  tool_type: 'api';
  schema: {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: {
        type: 'object';
        properties: Record<string, {
          type: string;
          description?: string;
          [key: string]: any;
        }>;
        required: string[];
        additionalProperties: boolean;
      };
      strict: boolean;
    };
  };
  execution: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string; // in this url must be possible to make like if a parameter is query it should be possible to do https://dummyjson.com/products/search?q={{query}}
    // headers?: Record<string, string>;
    body?: any;
    headers? : Record<string, string>;
  };
}

const ApiForm = () => {
  const nodeId = useNodeId();
    const { getNode, setNodes } = useReactFlow();
    
    // Get current node data
    const currentNode = nodeId ? getNode(nodeId) : null;
    const existingFormData = (currentNode?.data?.formData as apiFormData) || {} as apiFormData;
    const inputVariables = (currentNode?.data?.input_variables as InputVariable[]) || [];
    const [currentView, setCurrentView] = useState<'initial' | 'config'>('initial');
    
    // Initialize form data with proper API structure
    const [formData, setFormData] = useState<apiFormData>(() => {
      const initialData: apiFormData = {
        tool_type: 'api',
        schema: {
          type: 'function',
          function: {
            name: existingFormData.schema?.function?.name || '',
            description: existingFormData.schema?.function?.description || '',
            parameters: {
              type: 'object',
              properties: existingFormData.schema?.function?.parameters?.properties || {},
              required: existingFormData.schema?.function?.parameters?.required || [],
              additionalProperties: existingFormData.schema?.function?.parameters?.additionalProperties || false
            },
            strict: existingFormData.schema?.function?.strict || false
          }
        },
        execution: {
          method: existingFormData.execution?.method || 'GET',
          url: existingFormData.execution?.url || '',
          body: existingFormData.execution?.body,
          headers: existingFormData.execution?.headers || {},
        }
      };
      console.log('Initial formData:', initialData);
      return initialData;
    });
  
    // Additional effect to handle initial load when nodeId becomes available
    useEffect(() => {
      console.log("Loading form data for node:", nodeId);
      if (nodeId && currentNode) {
        const nodeFormData = (currentNode.data?.formData as apiFormData) || {};
        
        // Update API-specific form data
        setFormData(prev => ({
          ...prev,
          schema: {
            ...prev.schema,
            function: {
              ...prev.schema.function,
              name: nodeFormData.schema?.function?.name || prev.schema.function.name,
              description: nodeFormData.schema?.function?.description || prev.schema.function.description,
              parameters: {
                ...prev.schema.function.parameters,
                properties: nodeFormData.schema?.function?.parameters?.properties || prev.schema.function.parameters.properties,
                required: nodeFormData.schema?.function?.parameters?.required || prev.schema.function.parameters.required
              }
            }
          },
          execution: {
            ...prev.execution,
            method: nodeFormData.execution?.method || prev.execution.method,
            url: nodeFormData.execution?.url || prev.execution.url,
            body: nodeFormData.execution?.body || prev.execution.body,
            headers: nodeFormData.execution?.headers || prev.execution.headers,
          }
        }));
      }
    }, [nodeId]);
  
    // Update node data whenever form data changes (with debouncing to avoid infinite loops)
    useEffect(() => {
      console.log("Updating node data for node:", nodeId);
      console.log("New formData:", formData);
      if (nodeId) {
        const timeoutId = setTimeout(() => {
          setNodes((nodes) =>
            nodes.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      formData: formData
                    }
                  }
                : node
            )
          );
        }, 100); // Small debounce to avoid excessive updates
  
        return () => clearTimeout(timeoutId);
      }  }, [formData, nodeId]);
    // Helper function to handle schema updates
    const handleSchemaUpdate = (field: 'name' | 'description' | 'strict', value: string | boolean) => {
      console.log("run handleSchemaUpdate");
      console.log(`Updating schema.${field} to ${value}`);
      setFormData(prev => ({
        ...prev,
        schema: {
          ...prev.schema,
          function: {
            ...prev.schema.function,
            [field]: value
          }
        }
      }));
    };

    // Helper function to handle execution updates
    const handleExecutionUpdate = (field: keyof apiFormData['execution'], value: any) => {
      console.log("run handleExecutionUpdate");
      console.log(`Updating execution.${field} to ${value}`);
      setFormData(prev => ({
        ...prev,
        execution: {
          ...prev.execution,
          [field]: value
        }
      }));
    };

    // State for new property form
    const [newProperty, setNewProperty] = useState({
      name: '',
      type: 'string',
      description: '',
      required: false
    });

    // State for API test modal
    const [showTestModal, setShowTestModal] = useState(false);
    const [testParameters, setTestParameters] = useState<Record<string, any>>({});

    // State for new header form
    const [newHeader, setNewHeader] = useState({
      key: '',
      value: ''
    });

    // Add new property to schema
    const addProperty = () => {
      console.log("run addProperty");
      console.log("Adding new property:", newProperty);
      if (!newProperty.name) return;
      
      setFormData(prev => ({
        ...prev,
        schema: {
          ...prev.schema,
          function: {
            ...prev.schema.function,
            parameters: {
              ...prev.schema.function.parameters,
              properties: {
                ...prev.schema.function.parameters.properties,
                [newProperty.name]: { 
                  type: newProperty.type,
                  description: newProperty.description 
                }
              },
              required: newProperty.required 
                ? [...prev.schema.function.parameters.required, newProperty.name]
                : prev.schema.function.parameters.required
            }
          }
        }
      }));
      
      setNewProperty({ name: '', type: 'string', description: '', required: false });
    };

    // Add new header to execution
    const addHeader = () => {
      console.log("run addHeader");
      console.log("Adding new header:", newHeader);
      if (!newHeader.key) return;
      
      setFormData(prev => ({
        ...prev,
        execution: {
          ...prev.execution,
          headers: {
            ...prev.execution.headers,
            [newHeader.key]: newHeader.value
          }
        }
      }));
      
      setNewHeader({ key: '', value: '' });
    };

    // Remove header from execution
    const removeHeader = (headerKey: string) => {
      console.log("run removeHeader");
      console.log(`Removing header: ${headerKey}`);
      setFormData(prev => {
        const { [headerKey]: removed, ...remainingHeaders } = prev.execution.headers || {};
        return {
          ...prev,
          execution: {
            ...prev.execution,
            headers: remainingHeaders
          }
        };
      });
    };

    // Update existing header
    const updateHeader = (oldKey: string, newKey: string, newValue: string) => {
      console.log("run updateHeader");
      console.log(`Updating header ${oldKey} to ${newKey}: ${newValue}`);
      setFormData(prev => {
        const headers = { ...prev.execution.headers };
        if (oldKey !== newKey) {
          delete headers[oldKey];
        }
        headers[newKey] = newValue;
        return {
          ...prev,
          execution: {
            ...prev.execution,
            headers
          }
        };
      });
    };

    // Remove property from schema
    const removeProperty = (propertyName: string) => {
      console.log("run removeProperty");
      console.log(`Removing property: ${propertyName}`);
      setFormData(prev => {
        const { [propertyName]: removed, ...remainingProperties } = prev.schema.function.parameters.properties;
        return {
          ...prev,
          schema: {
            ...prev.schema,
            function: {
              ...prev.schema.function,
              parameters: {
                ...prev.schema.function.parameters,
                properties: remainingProperties,
                required: prev.schema.function.parameters.required.filter(name => name !== propertyName)
              }
            }
          }
        };
      });
    };
    const goToConfig = () => {
      setCurrentView('config');
    };
  
    const goBackToInitial = () => {
      setCurrentView('initial');
    };

    // Initialize test parameters with default values
    const initializeTestParameters = () => {
      const params: Record<string, any> = {};
      Object.entries(formData.schema.function.parameters.properties).forEach(([key, prop]: [string, any]) => {
        switch (prop.type) {
          case 'string':
            params[key] = '';
            break;
          case 'number':
          case 'integer':
            params[key] = 0;
            break;
          case 'boolean':
            params[key] = false;
            break;
          case 'array':
            params[key] = '';
            break;
          case 'object':
            params[key] = '{}';
            break;
          default:
            params[key] = '';
        }
      });
      setTestParameters(params);
      setShowTestModal(true);
    };

    // Handle test parameter changes
    const handleTestParameterChange = (paramName: string, value: any) => {
      setTestParameters(prev => ({
        ...prev,
        [paramName]: value
      }));
    };
  // API Test function
  const testApiEndpoint = async () => {
    console.log("Running API test with formData:", formData);
    console.log("Using test parameters:", testParameters);
    
    try {
      // Prepare test data from user input
      const testData: any = {};
      
      Object.entries(testParameters).forEach(([key, value]) => {
        const propType = formData.schema.function.parameters.properties[key]?.type;
        
        // Convert values based on parameter type
        switch (propType) {
          case 'number':
          case 'integer':
            testData[key] = value === '' ? 0 : Number(value);
            break;
          case 'boolean':
            testData[key] = Boolean(value);
            break;
          case 'array':
            try {
              testData[key] = value === '' ? [] : JSON.parse(value);
            } catch {
              testData[key] = value.split(',').map((item: string) => item.trim());
            }
            break;
          case 'object':
            try {
              testData[key] = value === '' ? {} : JSON.parse(value);
            } catch {
              testData[key] = {};
            }
            break;
          default:
            testData[key] = value;
        }
      });

      // Replace URL parameters with test data
      let testUrl = formData.execution.url;
      Object.entries(testData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        testUrl = testUrl.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(value));
      });

      // Prepare request body with parameter substitution
      let requestBody = formData.execution.body;
      if (requestBody && typeof requestBody === 'object') {
        let bodyString = JSON.stringify(requestBody);
        Object.entries(testData).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          bodyString = bodyString.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
            typeof value === 'string' ? `"${value}"` : String(value));
        });
        try {
          requestBody = JSON.parse(bodyString);
        } catch {
          // If parsing fails, use original body
          requestBody = formData.execution.body;
        }
      }

      // Prepare headers with parameter substitution
      let requestHeaders = {
        'Content-Type': 'application/json',
        ...formData.execution.headers
      };
      
      if (formData.execution.headers && typeof formData.execution.headers === 'object') {
        let headersString = JSON.stringify(formData.execution.headers);
        Object.entries(testData).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          headersString = headersString.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
            typeof value === 'string' ? `"${value}"` : String(value));
        });
        try {
          const parsedHeaders = JSON.parse(headersString);
          requestHeaders = {
            'Content-Type': 'application/json',
            ...parsedHeaders
          };
        } catch {
          // If parsing fails, use original headers
          requestHeaders = {
            'Content-Type': 'application/json',
            ...formData.execution.headers
          };
        }
      }

      // Make the API call
      const response = await fetch(testUrl, {
        method: formData.execution.method,
        headers: requestHeaders,
        body: formData.execution.method !== 'GET' ? JSON.stringify(requestBody) : undefined,
      });

      const result = await response.text();
      
      // Close the modal and show results
      setShowTestModal(false);
      
      alert(`API Test Result:\nURL: ${testUrl}\nStatus: ${response.status}\nResponse: ${result.substring(0, 500)}${result.length > 500 ? '...' : ''}`);
    } catch (error) {
      setShowTestModal(false);
      alert(`API Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (currentView === 'config') {
    return (
      <div className="h-screen flex flex-col max-h-[90vh]">
        {/* Fixed header */}
        <div className="flex-shrink-0 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentView('initial')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to API Details</span>
            </button>
          </div>          
        </div>        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Variable Usage Helper */}
            <VariableUsageHelper inputVariables={inputVariables} />
            
            <div className="space-y-4">{/* Function Schema */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Function Schema</h3>
        </div>
        
        <div className="space-y-3">          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Function Name *
            </label>
            <input
              type="text"
              value={formData.schema.function.name}
              onChange={(e) => handleSchemaUpdate('name', e.target.value)}
              placeholder="get_weather"
              className="w-full px-2 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Description *
            </label>
            <textarea
              value={formData.schema.function.description}
              onChange={(e) => handleSchemaUpdate('description', e.target.value)}
              placeholder="Get current weather information for a location"
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Strict Mode Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.schema.function.strict}
                onChange={(e) => handleSchemaUpdate('strict', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <div>
                <span className="text-xs font-medium text-muted-foreground">Strict Mode</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  When enabled, the API will strictly validate parameters according to the schema
                </p>
              </div>
            </label>
          </div>{/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-muted-foreground">
                Parameters
              </label>
              <button
                onClick={addProperty}
                disabled={!newProperty.name}
                className="flex items-center gap-1 px-2 py-1 bg-red-800 text-primary-foreground rounded-md hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors text-xs"
              >
                <Plus className="h-3 w-3" />
                Add Property
              </button>
            </div>

            {/* Add new property */}
            <div className="grid grid-cols-1 gap-3 mb-3 p-3 bg-muted/50 rounded-md border border-border">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Property Name</label>
                  <input
                    type="text"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., query, location, id"
                    className="w-full px-2 py-1 border border-border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                  <select
                    value={newProperty.type}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-2 py-1 border border-border rounded text-xs"
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
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <input
                  type="text"
                  value={newProperty.description}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Search query to retrieve relevant information"
                  className="w-full px-2 py-1 border border-border rounded text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={newProperty.required}
                    onChange={(e) => setNewProperty(prev => ({ ...prev, required: e.target.checked }))}
                  />
                  Required Parameter
                </label>
              </div>
            </div>            {/* Existing properties */}
            <div className="space-y-2">
              {Object.entries(formData.schema.function.parameters.properties).map(([name, prop]: [string, any]) => (
                <div key={name} className="p-3 bg-card border border-border rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">{name}</span>
                      {formData.schema.function.parameters.required.includes(name) && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Required</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeProperty(name)}
                      className="text-destructive hover:text-destructive/80 p-1"
                      title="Remove parameter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                      <select
                        value={prop.type || 'string'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            schema: {
                              ...prev.schema,
                              function: {
                                ...prev.schema.function,
                                parameters: {
                                  ...prev.schema.function.parameters,
                                  properties: {
                                    ...prev.schema.function.parameters.properties,
                                    [name]: { ...prop, type: e.target.value }
                                  }
                                }
                              }
                            }
                          }));
                        }}
                        className="w-full px-2 py-1 border border-border rounded text-xs"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="integer">Integer</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={formData.schema.function.parameters.required.includes(name)}
                          onChange={(e) => {
                            const isRequired = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              schema: {
                                ...prev.schema,
                                function: {
                                  ...prev.schema.function,
                                  parameters: {
                                    ...prev.schema.function.parameters,
                                    required: isRequired
                                      ? [...prev.schema.function.parameters.required.filter(n => n !== name), name]
                                      : prev.schema.function.parameters.required.filter(n => n !== name)
                                  }
                                }
                              }
                            }));
                          }}
                        />
                        Required
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                    <input
                      type="text"
                      value={prop.description || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          schema: {
                            ...prev.schema,
                            function: {
                              ...prev.schema.function,
                              parameters: {
                                ...prev.schema.function.parameters,
                                properties: {
                                  ...prev.schema.function.parameters.properties,
                                  [name]: { ...prop, description: e.target.value }
                                }
                              }
                            }
                          }
                        }));
                      }}                      placeholder="Describe what this parameter is used for"
                      className="w-full px-2 py-1 border border-border rounded text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Execution */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-red-800" />
          <h3 className="text-base font-semibold">API Execution</h3>
        </div>
        
        <div className="space-y-3">          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                HTTP Method *
              </label>
              <select
                value={formData.execution.method}
                onChange={(e) => handleExecutionUpdate('method', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              URL *
            </label>
            <input
              type="url"
              value={formData.execution.url}
              onChange={(e) => handleExecutionUpdate('url', e.target.value)}
              placeholder="https://api.example.com/weather"
              className="w-full px-2 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            
            {/* URL Parameter Usage Helper */}
            {Object.keys(formData.schema.function.parameters.properties).length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs font-medium text-blue-800 mb-1">💡 Parameter Usage Examples:</div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>Path parameters:</strong> https://api.example.com/users/{`{{id}}`}</div>
                  <div><strong>Query parameters:</strong> https://api.example.com/search?q={`{{query}}`}&limit={`{{limit}}`}</div>
                  <div className="text-blue-600 mt-1">
                    <strong>Available parameters:</strong> {Object.keys(formData.schema.function.parameters.properties).map(param => `{{${param}}}`).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-muted-foreground">
                Headers
              </label>
              <button
                onClick={addHeader}
                disabled={!newHeader.key}
                className="flex items-center gap-1 px-2 py-1 bg-red-800 text-primary-foreground rounded-md hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors text-xs"
              >
                <Plus className="h-3 w-3" />
                Add Header
              </button>
            </div>

            {/* Add new header */}
            <div className="grid grid-cols-1 gap-3 mb-3 p-3 bg-muted/50 rounded-md border border-border">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Header Name</label>
                  <input
                    type="text"
                    value={newHeader.key}
                    onChange={(e) => setNewHeader(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="e.g., Authorization, X-API-Key"
                    className="w-full px-2 py-1 border border-border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Header Value</label>
                  <input
                    type="text"
                    value={newHeader.value}
                    onChange={(e) => setNewHeader(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="e.g., Bearer {{token}}, {{api_key}}"
                    className="w-full px-2 py-1 border border-border rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Existing headers */}
            <div className="space-y-2">
              {Object.entries(formData.execution.headers || {}).map(([key, value]: [string, string]) => (
                <div key={key} className="p-3 bg-card border border-border rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">{key}</span>
                    </div>
                    <button
                      onClick={() => removeHeader(key)}
                      className="text-destructive hover:text-destructive/80 p-1"
                      title="Remove header"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateHeader(key, e.target.value, value)}
                        className="w-full px-2 py-1 border border-border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Value</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateHeader(key, key, e.target.value)}
                        placeholder="Header value (can use {{parameter}} syntax)"
                        className="w-full px-2 py-1 border border-border rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Headers Parameter Usage Helper */}
            {Object.keys(formData.schema.function.parameters.properties).length > 0 && (
              <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                <div className="text-xs font-medium text-purple-800 mb-1">💡 Use parameters in headers:</div>
                <div className="text-xs text-purple-700">
                  <div>Example: Authorization = Bearer {`{{token}}`}, X-API-Key = {`{{api_key}}`}</div>
                  <div className="text-purple-600 mt-1">
                    <strong>Available:</strong> {Object.keys(formData.schema.function.parameters.properties).map(param => `{{${param}}}`).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {formData.execution.method !== 'GET' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Request Body (JSON)
              </label>
              <textarea
                value={JSON.stringify(formData.execution.body || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleExecutionUpdate('body', parsed);
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"location": "{{location}}", "units": "{{units}}"}'
                rows={4}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono"
              />
              
              {/* Body Parameter Usage Helper */}
              {Object.keys(formData.schema.function.parameters.properties).length > 0 && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-xs font-medium text-green-800 mb-1">💡 Use parameters in request body:</div>
                  <div className="text-xs text-green-700">
                    <div>Example: {`{"query": "{{query}}", "limit": {{limit}}, "filters": {"type": "{{type}}"}}`}</div>
                    <div className="text-green-600 mt-1">
                      <strong>Available:</strong> {Object.keys(formData.schema.function.parameters.properties).map(param => `{{${param}}}`).join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* API Test */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Test API</h3>
        <button 
          onClick={initializeTestParameters}
          className="flex items-center gap-2 px-3 py-2 bg-red-800 text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Play className="h-3 w-3" />
          Execute Test Call
        </button>        <p className="text-xs text-muted-foreground">
          Test your API configuration with custom parameter values to verify it works correctly.
        </p>
      </div>
            </div>
          </div>
        </div>

        {/* Test Parameters Modal */}
        {showTestModal && (
          <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
            <DialogContent className="sm:max-w-[600px] bg-background max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Set Test Parameters</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Configure the values for each parameter to test your API endpoint.
                </DialogDescription>
              </DialogHeader>              <div className="space-y-4 mt-4">
                {Object.entries(formData.schema.function.parameters.properties).map(([paramName, prop]: [string, any]) => (
                  <div key={paramName} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium">
                        {paramName}
                      </label>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {prop.type}
                      </span>
                      {formData.schema.function.parameters.required.includes(paramName) && (
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">Required</span>
                      )}
                    </div>                    
                    {prop.description && (
                      <p className="text-xs text-muted-foreground mb-2">{prop.description}</p>
                    )}

                    {prop.type === 'boolean' ? (
                      <Select
                        value={testParameters[paramName] ? 'true' : 'false'}
                        onValueChange={(value) => handleTestParameterChange(paramName, value === 'true')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select boolean value" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">false</SelectItem>
                          <SelectItem value="true">true</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : prop.type === 'array' ? (
                      <textarea
                        value={testParameters[paramName] || ''}
                        onChange={(e) => handleTestParameterChange(paramName, e.target.value)}
                        placeholder='["item1", "item2"] or item1, item2, item3'
                        rows={2}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm font-mono resize-none"
                      />
                    ) : prop.type === 'object' ? (
                      <textarea
                        value={testParameters[paramName] || ''}
                        onChange={(e) => handleTestParameterChange(paramName, e.target.value)}
                        placeholder='{"key": "value"}'
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm font-mono resize-none"
                      />
                    ) : (
                      <Input
                        type={prop.type === 'number' || prop.type === 'integer' ? 'number' : 'text'}
                        value={testParameters[paramName] || ''}
                        onChange={(e) => handleTestParameterChange(paramName, e.target.value)}
                        placeholder={`Enter ${prop.type} value`}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>

              {Object.keys(formData.schema.function.parameters.properties).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No parameters configured for this API.</p>
                  <p className="text-sm mt-1">The test will run without parameters.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowTestModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={testApiEndpoint}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Run Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <BaseNodeForm
      nodeTypeLabel="API Tool"
      instructionText="Configure your API tool to integrate with external APIs. Set up endpoints, authentication, request parameters, and response handling. API tools provide comprehensive configuration options for complex integrations."
      instructionIcon={<Globe className="h-5 w-5 text-red-400" />}
      borderColor="border-red-400"
      textColor="text-red-800"
      backgroundColor="bg-red-50"
      descriptionTextColor="text-red-600"
    >      {/* API Configuration Section */}
      <div className="bg-gray-50 p-4 rounded-md border">
        <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-800">API Configuration</h4>
              <p className="text-xs text-gray-500 mt-1">Configure URL, parameters, and authentication</p>
            </div>
          <button
            onClick={() => setCurrentView('config')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Configure
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* API Status indicator */}
        <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {formData.schema.function.name ? `API Tool: ${formData.schema.function.name}` : 'API Tool - Click Configure to set up'}
            </span>
          </div>
        </div>
      </div>
    </BaseNodeForm>
  );
};

export default ApiForm;
