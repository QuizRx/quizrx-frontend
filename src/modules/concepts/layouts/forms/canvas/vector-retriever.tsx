import { useState, useEffect, useCallback } from "react";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { ChevronRight, ArrowLeft, Settings, Database, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import BaseNodeForm, { useBaseNodeForm } from "./base-node-form";

// Define the VectorRetrieverTool interface directly in this file
export interface VectorRetrieverTool {
  belongs_to: string;
  tool_type: 'vector_retriever';
  database_url: string;
  collection_name: string;
  embedding_model: string;
  api_key?: string;
  search_params?: {
    limit?: number;
    threshold?: number;
    metadata_filter?: Record<string, any>;
  };
}

const VectorRetrieverForm = () => {
  const nodeId = useNodeId();
  const { getNode, setNodes } = useReactFlow();
    // Use the base form hook for standard node properties including input variables
  const {
    nodeName,
  } = useBaseNodeForm();
  
  // Get current node data
  const currentNode = nodeId ? getNode(nodeId) : null;
  const nodeData = currentNode?.data || {};
  const existingFormData = (currentNode?.data?.formData as VectorRetrieverTool) || {} as VectorRetrieverTool;

  const [currentView, setCurrentView] = useState<'initial' | 'config'>('initial');

  // Initialize form data with Vector Retriever structure
  const [formData, setFormData] = useState<VectorRetrieverTool>(() => {
    if (existingFormData && existingFormData.tool_type === 'vector_retriever') {
      return existingFormData;
    }
    // Default Vector Retriever structure
    return {
      belongs_to: nodeId || '',
      tool_type: 'vector_retriever',
      database_url: '',
      collection_name: '',
      embedding_model: ''
    } as VectorRetrieverTool;
  });

  // Additional effect to handle initial load when nodeId becomes available
  useEffect(() => {
    if (nodeId && currentNode) {
      const nodeFormData = (currentNode.data?.formData as VectorRetrieverTool) || {};
      
      // Update tool-specific form data only if we have existing data
      if (nodeFormData.tool_type === 'vector_retriever') {
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
  }, [formData, nodeId]);

  const [showApiKey, setShowApiKey] = useState(false);

  const handleVectorToolUpdate = (field: keyof VectorRetrieverTool, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchParamUpdate = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      search_params: {
        ...prev.search_params,
        [field]: value
      }
    }));
  };

  // Vector Retriever Configuration Component (self-contained)
  const VectorRetrieverConfigSection = () => (
    <div className="space-y-6">
      {/* Database Connection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Database Connection
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database URL *
            </label>
            <input
              type="url"
              value={formData.database_url}
              onChange={(e) => handleVectorToolUpdate('database_url', e.target.value)}
              placeholder="https://your-vector-db.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={formData.collection_name}
              onChange={(e) => handleVectorToolUpdate('collection_name', e.target.value)}
              placeholder="my_embeddings"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embedding Model *
            </label>
            <select
              value={formData.embedding_model}
              onChange={(e) => handleVectorToolUpdate('embedding_model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select embedding model</option>
              <option value="text-embedding-ada-002">OpenAI: text-embedding-ada-002</option>
              <option value="text-embedding-3-small">OpenAI: text-embedding-3-small</option>
              <option value="text-embedding-3-large">OpenAI: text-embedding-3-large</option>
              <option value="sentence-transformers/all-MiniLM-L6-v2">Sentence Transformers: all-MiniLM-L6-v2</option>
              <option value="sentence-transformers/all-mpnet-base-v2">Sentence Transformers: all-mpnet-base-v2</option>
              <option value="custom">Custom Model</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={formData.api_key || ''}
                onChange={(e) => handleVectorToolUpdate('api_key', e.target.value)}
                placeholder="Enter API key if required"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Parameters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Search Parameters
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result Limit
              </label>
              <input
                type="number"
                value={formData.search_params?.limit || 10}
                onChange={(e) => handleSearchParamUpdate('limit', parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Similarity Threshold
              </label>
              <input
                type="number"
                value={formData.search_params?.threshold || 0.7}
                onChange={(e) => handleSearchParamUpdate('threshold', parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metadata Filter (JSON)
            </label>
            <textarea
              value={JSON.stringify(formData.search_params?.metadata_filter || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleSearchParamUpdate('metadata_filter', parsed);
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"category": "documents", "language": "en"}'
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Connection</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Test Vector Database Connection
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Verify that your vector database is accessible and the collection exists.
        </p>
      </div>
    </div>
  );

  const handleVectorToolUpdate_Legacy = (updatedTool: VectorRetrieverTool) => {
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
              <span className="text-sm">Back to Vector Retriever Details</span>
            </button>
          </div>          
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <VectorRetrieverConfigSection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <BaseNodeForm
      nodeTypeLabel="Vector Retriever"
      instructionText="Configure your vector retriever to search and retrieve vectors from vector databases. Set up database connections, embedding models, and search parameters for semantic similarity queries."
      instructionIcon={<Database className="h-5 w-5 text-blue-400" />}
      borderColor="border-blue-400"
      textColor="text-blue-800"
      backgroundColor="bg-blue-50"
      descriptionTextColor="text-blue-600"
    >
      {/* Vector Retriever Configuration Section */}
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-blue-800">Vector Database Configuration</h3>
          <button
            onClick={() => setCurrentView('config')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Configure</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Vector Retriever Status indicator */}
        <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Vector Retriever ready for semantic search queries
            </span>
          </div>
        </div>
      </div>
    </BaseNodeForm>
  );
};

export default VectorRetrieverForm;
