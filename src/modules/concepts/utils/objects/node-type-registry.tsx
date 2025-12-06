import { Blocks, Bot, Diameter, FileOutput, LucideIcon, PlayCircle, Route, Rows4, Settings, Text, OctagonPause, Globe, Database, DatabaseZap } from "lucide-react";
import { ReactNode } from "react";
import AgentForm from "../../layouts/forms/canvas/agent";
import StartForm from "../../layouts/forms/canvas/start";
import EndForm from "../../layouts/forms/canvas/end";
import ApiForm from "../../layouts/forms/canvas/api";
import VectorRetrieverForm from "../../layouts/forms/canvas/vector-retriever";
import GraphRetrieverForm from "../../layouts/forms/canvas/graph-retriever";
import RouterForm from "../../layouts/forms/canvas/router";

// Input variable type for workflow global variables
export interface InputVariable {
  coming_node: string; // node_id or "system" 
  variable: string; // "response", "user_message", or structured output field name
  name: string; // user-friendly name for the variable
}

export const generateUniqueId = (type: string): string => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 5);
  return `${type}-${timestamp}-${randomString}`;
};

// Define a registry type that specifies node type configurations
export interface NodeTypeConfig {
  name: string;
  description: string;
  input_variables?: InputVariable[]; // Default input variables for this node type
  width: number;
  height: number;
  Icon: LucideIcon;
  form: ReactNode;
  color: string;
  schema?: object; // For potential future use with validation
  defaultFormData?: Record<string, any>; // Default form data for this node type
}

// Define known node types for TypeScript
export type NodeTypes = "agent" | "api" | "trigger" | "start" | "router" | "vector_retriever" | "graph_retriever" | string;
export const BasicNodes = ["start", "end"];
export const ModuleNodes = ["agent", "router"];
export const UtilityNodes = ["api", "vector_retriever", "graph_retriever"];
// Create a registry object to store node type configurations
export const NodeTypeRegistry: Record<NodeTypes, NodeTypeConfig> = {
  vector_retriever: {
    name: "Vector Retriever",
    description: "A node to retrieve vectors from a database",
    width: 200,
    height: 50,
    Icon: Database,
    form: <VectorRetrieverForm />,
    color: "blue-600",    
    defaultFormData: {
      database_url: '',
      collection_name: '',
      embedding_model: '',
      input_variables: []
    }
  },
  graph_retriever: {
    name: "Graph Retriever",
    description: "A node to retrieve data from a graph database",
    width: 200,
    height: 50,
    Icon: DatabaseZap,
    form: <GraphRetrieverForm />,
    color: "orange-600",    
    defaultFormData: {
      graph_database_url: '',
      query_language: 'cypher',
      max_depth: 3,
      input_variables: []
    }
  },
  agent: {
    name: "Agent",
    description: "An intelligent agent to process tasks",
    width: 200,
    height: 50,
    Icon: Bot,
    form: <AgentForm />,
    color: "purple-600",
    defaultFormData: {
      system_prompt: "",
      input_variables: [],
      use_chat_history: false,
      use_structured_output: false,
      structured_output: {}
    }
  },  
  api: {
    name: "API",
    description: "A node to configure API calls for your workflow",
    width: 200,
    height: 50,
    Icon: Globe,
    form: <ApiForm />,
    color: "red-600",
    defaultFormData: {
      tool_type: 'api',
      schema: {
        type: 'function',
        function: {
          name: '',
          description: '',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false
          },
          strict: false
        }
      },
      execution: {
        method: 'GET',
        url: '',
        headers: {
          Authorization: ""
        },        url_params: [],
        body_params: [],
      },
      input_variables: []
    }
  },
  start: {
    name: "Start",
    description: "An initial node to start your workflow",
    width: 200,
    height: 50,
    Icon: PlayCircle,    
    defaultFormData: {
      input_variables: ["system.user_message"],
    },
    form: <StartForm />,
    color: "green-600",
  },
  end: {
    name: "End",
    description: "An end node to terminate your workflow",
    width: 200,
    height: 50,
    Icon: OctagonPause,    
    defaultFormData: {
      input_variables: [],
    },
    form: <EndForm />,
    color: "red-600",
  },
  router: {
    name: "Router",
    description: "A node to route data based on conditions",
    width: 200,
    height: 50,
    Icon: Route,
    form: <RouterForm />,
    color: "yellow-600",
    defaultFormData: {
      system_prompt: '',
      use_chat_history: false,      routes: [],
      input_variables: []
    }
  },
};

// Function to create a node meta object from a type
export function createNodeMetaFromType(type: string): NodeMeta {
  const config = NodeTypeRegistry[type];
  if (!config) {
    throw new Error(`Node type '${type}' not found in registry`);
  }

  return {
    id: generateUniqueId(type),
    type,
    ...config,
  };
}

// Exportable node meta interface (same as before)
export interface NodeMeta {
  id: string;
  name: string;
  description: string;
  type: string;
  width?: number;
  height?: number;
  Icon?: LucideIcon;
  image?: string;
  form: ReactNode;
  color?: string;
}
