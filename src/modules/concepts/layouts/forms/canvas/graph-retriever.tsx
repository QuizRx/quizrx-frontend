import { useState, useEffect, useCallback } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, Settings, DatabaseZap, Plus, Trash2, Eye, EyeOff, Play } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";

// Define the GraphRetrieverTool interface directly in this file
export interface GraphRetrieverTool {
  belongs_to: string;
  tool_type: 'graph_retriever';
  graph_database_url: string;
  query_language: 'cypher' | 'gremlin' | 'sparql';
  max_depth: number;
  auth?: {
    username?: string;
    password?: string;
    api_key?: string;
  };
  query_templates?: {
    name: string;
    query: string;
    description: string;
  }[];
}

const GraphRetrieverForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();
    // Use the base form hook for standard node properties including input variables
  const {
    nodeName,
    
  } = useBaseNodeForm();
  
  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  const nodeData = currentNode?.data || {};
  const existingFormData = (currentNode?.data?.formData as GraphRetrieverTool) || {} as GraphRetrieverTool;

  const [currentView, setCurrentView] = useState<'initial' | 'config'>('initial');

  // Initialize form data with Graph Retriever structure
  const [formData, setFormData] = useState<GraphRetrieverTool>(() => {
    if (existingFormData && existingFormData.tool_type === 'graph_retriever') {
      return existingFormData;
    }
    // Default Graph Retriever structure
    return {
      belongs_to: nodeId || '',
      tool_type: 'graph_retriever',
      graph_database_url: '',
      query_language: 'cypher',
      max_depth: 3,
      auth: {},
      query_templates: []
    } as GraphRetrieverTool;
  });
  useEffect(() => {
    if (nodeId && currentNode) {
      const nodeFormData = (currentNode.data?.formData as GraphRetrieverTool) || {};
      
      // Update tool-specific form data only if we have existing data
      if (nodeFormData.tool_type === 'graph_retriever') {
        setFormData(nodeFormData);
      }
    }
  }, [nodeId, currentNode]);

  // Update node data with improved debouncing to prevent focus loss
  useEffect(() => {
    if (!nodeId) return;

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
    }, 500); // Increased debounce time to prevent frequent updates

    return () => clearTimeout(timeoutId);
  }, [formData, nodeId, setNodes]);

  const [showPassword, setShowPassword] = useState(false);
  const [testQuery, setTestQuery] = useState('');

  const handleGraphToolUpdate = (field: keyof GraphRetrieverTool, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAuthUpdate = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      auth: {
        ...prev.auth,
        [field]: value
      }
    }));
  };

  const handleQueryTemplateUpdate = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      query_templates: prev.query_templates?.map((template, i) => 
        i === index ? { ...template, [field]: value } : template
      ) || []
    }));
  };

  const addQueryTemplate = () => {
    setFormData(prev => ({
      ...prev,
      query_templates: [
        ...(prev.query_templates || []),
        { name: '', query: '', description: '' }
      ]
    }));
  };

  const removeQueryTemplate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      query_templates: prev.query_templates?.filter((_, i) => i !== index) || []
    }));
  };

  // Graph Retriever Configuration Component (self-contained)
  const GraphRetrieverConfigSection = () => (
    <div className="space-y-6">
      {/* Database Connection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DatabaseZap className="h-5 w-5 text-orange-600" />
          Graph Database Connection
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database URL *
            </label>
            <input
              type="url"
              value={formData.graph_database_url}
              onChange={(e) => handleGraphToolUpdate('graph_database_url', e.target.value)}
              placeholder="bolt://localhost:7687 or neo4j://localhost:7687"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Query Language *
            </label>
            <select
              value={formData.query_language}
              onChange={(e) => handleGraphToolUpdate('query_language', e.target.value as 'cypher' | 'gremlin' | 'sparql')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="cypher">Cypher (Neo4j)</option>
              <option value="gremlin">Gremlin (Apache TinkerPop)</option>
              <option value="sparql">SPARQL (RDF)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Traversal Depth
            </label>
            <input
              type="number"
              value={formData.max_depth}
              onChange={(e) => handleGraphToolUpdate('max_depth', parseInt(e.target.value))}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Authentication</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.auth?.username || ''}
              onChange={(e) => handleAuthUpdate('username', e.target.value)}
              placeholder="neo4j"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.auth?.password || ''}
                onChange={(e) => handleAuthUpdate('password', e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key (if applicable)
            </label>
            <input
              type="password"
              value={formData.auth?.api_key || ''}
              onChange={(e) => handleAuthUpdate('api_key', e.target.value)}
              placeholder="Enter API key if required"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Query Templates */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Query Templates</h3>
          <button
            onClick={addQueryTemplate}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Template
          </button>
        </div>
        
        <div className="space-y-4">
          {(formData.query_templates || []).map((template, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Template {index + 1}</h4>
                <button
                  onClick={() => removeQueryTemplate(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) => handleQueryTemplateUpdate(index, 'name', e.target.value)}
                    placeholder="Find related nodes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Query
                  </label>
                  <textarea
                    value={template.query}
                    onChange={(e) => handleQueryTemplateUpdate(index, 'query', e.target.value)}
                    placeholder="MATCH (n)-[r]-(m) WHERE n.id = $nodeId RETURN n, r, m LIMIT 10"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={template.description}
                    onChange={(e) => handleQueryTemplateUpdate(index, 'description', e.target.value)}
                    placeholder="Describe what this query does..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(!formData.query_templates || formData.query_templates.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <DatabaseZap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No query templates yet. Add one to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Connection Test */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Connection</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Query
            </label>
            <textarea
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="MATCH (n) RETURN count(n)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Play className="h-4 w-4" />
            Execute Test Query
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          Test your connection and verify that queries execute successfully.
        </p>
      </div>
    </div>
  );

  const handleGraphToolUpdate_Legacy = (updatedTool: GraphRetrieverTool) => {
    setFormData(updatedTool);
  };

  if (currentView === 'config') {
    return (
      <div className="h-screen flex flex-col">
        {/* Fixed header */}
        <div className="flex-shrink-0 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentView('initial')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Graph Retriever Details</span>
            </button>
          </div>          
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <GraphRetrieverConfigSection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <BaseNodeForm
      nodeTypeLabel="Graph Retriever"
      instructionText="Configure your graph retriever to query and retrieve data from graph databases. Set up database connections, query languages (Cypher, Gremlin, SPARQL), and traversal parameters for relationship-based queries."
      instructionIcon={<DatabaseZap className="h-5 w-5 text-orange-400" />}
      borderColor="border-orange-400"
      textColor="text-orange-800"
      backgroundColor="bg-orange-50"
      descriptionTextColor="text-orange-600"
    >
      {/* Graph Retriever Configuration Section */}
      <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-orange-800">Graph Database Configuration</h3>
          <button
            onClick={() => setCurrentView('config')}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <span>Configure</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Graph Retriever Status indicator */}
        <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <DatabaseZap className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Graph Retriever ready for relationship-based queries
            </span>
          </div>
        </div>
      </div>
    </BaseNodeForm>
  );
};

export default GraphRetrieverForm;
