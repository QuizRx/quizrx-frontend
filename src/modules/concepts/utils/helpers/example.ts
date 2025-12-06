// const allobj = {
//   "id": "687f8b46fec717c50c9ed4c7",
//   "flowData": {
//     "nodes": [
//       {
//         "id": "start-mdop5irq-bkyy5",
//         "type": "editableNode",
//         "position": {
//           "x": -345,
//           "y": 60
//         },
//         "data": {
//           "id": "start-mdop5irq-bkyy5",
//           "type": "start",
//           "formData": {},
//           "name": "Start",
//           "description": "An initial node to start your workflow",
//           "width": 200,
//           "height": 50,
//           "Icon": {},
//           "form": {
//             "key": null,
//             "props": {},
//             "_owner": null,
//             "_store": {}
//           },
//           "color": "green-600"
//         },
//         "measured": {
//           "width": 263,
//           "height": 175
//         },
//         "selected": false,
//         "dragging": false
//       },
//       {
//         "id": "agent-mdop5irq-2inn5",
//         "type": "editableNode",
//         "position": {
//           "x": 795,
//           "y": -60
//         },
//         "data": {
//           "id": "agent-mdop5irq-2inn5",
//           "type": "agent",
//           "formData": {
//             "system_prompt": "e"
//           },
//           "name": "Products Agent",
//           "description": "An intelligent agent to process tasks",
//           "width": 200,
//           "height": 50,
//           "Icon": {},
//           "form": {
//             "key": null,
//             "props": {},
//             "_owner": null,
//             "_store": {}
//           },
//           "color": "purple-600",
//           "defaultFormData": {
//             "system_prompt": ""
//           }
//         },
//         "measured": {
//           "width": 270,
//           "height": 175
//         },
//         "selected": false,
//         "dragging": false
//       },
//       {
//         "id": "api-1753803468102",
//         "type": "editableNode",
//         "position": {
//           "x": 765,
//           "y": 450
//         },
//         "data": {
//           "id": "api-mdopawqu-4lj6x",
//           "type": "api",
//           "name": "API",
//           "description": "A node to configure API calls for your workflow",
//           "formData": {
//             "tool_type": "api",
//             "schema": {
//               "type": "function",
//               "function": {
//                 "name": "web_search",
//                 "description": "Search the web for a given query",
//                 "parameters": {
//                   "type": "object",
//                   "properties": {
//                     "query": {
//                       "type": "string",
//                       "description": "Search query to retrieve relevant information."
//                     }
//                   },
//                   "required": [
//                     "query"
//                   ],
//                   "additionalProperties": false
//                 },
//                 "strict": false
//               }
//             },
//             "execution": {
//               "method": "GET",
//               "url": "https://dummyjson.com/products/search?q={{query}}",
//               "timeout": 30,
//               "retries": 3
//             }
//           },
//           "width": 200,
//           "height": 50,
//           "Icon": {},
//           "form": {
//             "key": null,
//             "props": {},
//             "_owner": null,
//             "_store": {}
//           },
//           "color": "red-600",
//           "defaultFormData": {
//             "toolType": "api",
//             "configuration": {
//               "endpoint": "",
//               "method": "GET",
//               "authentication": "none",
//               "headers": {},
//               "timeout": 30,
//               "retries": 3
//             },
//             "inputSchema": "",
//             "outputSchema": "",
//             "testConfig": {
//               "enabled": false,
//               "sampleInput": "",
//               "expectedOutput": ""
//             }
//           }
//         },
//         "measured": {
//           "width": 316,
//           "height": 175
//         },
//         "selected": false,
//         "dragging": false
//       },
//       {
//         "id": "end-1753803541773",
//         "type": "editableNode",
//         "position": {
//           "x": 1365,
//           "y": -45
//         },
//         "data": {
//           "id": "end-mdopchl9-4ksu2",
//           "type": "end",
//           "name": "End",
//           "description": "An end node to terminate your workflow",
//           "formData": {},
//           "width": 200,
//           "height": 50,
//           "Icon": {},
//           "form": {
//             "key": null,
//             "props": {},
//             "_owner": null,
//             "_store": {}
//           },
//           "color": "red-600"
//         },
//         "measured": {
//           "width": 282,
//           "height": 175
//         },
//         "selected": false,
//         "dragging": false
//       },
//       {
//         "id": "router-1753803950396",
//         "type": "editableNode",
//         "position": {
//           "x": 135,
//           "y": 0
//         },
//         "data": {
//           "id": "router-mdopl8vx-u2zkc",
//           "type": "router",
//           "name": "Router",
//           "description": "A node to route data based on conditions",
//           "formData": {
//             "system_prompt": "dr eric or not",
//             "routes": [
//               {
//                 "choice": "dr eric",
//                 "target_agent": "agent-mdop5irq-2inn5",
//                 "id": "1753803966050"
//               },
//               {
//                 "choice": "products",
//                 "target_agent": "agent-1753804000344",
//                 "id": "1753803973846"
//               }
//             ]
//           },
//           "width": 200,
//           "height": 50,
//           "Icon": {},
//           "form": {
//             "key": null,
//             "props": {},
//             "_owner": null,
//             "_store": {}
//           },
//           "color": "yellow-600",
//           "defaultFormData": {
//             "system_prompt": "",
//             "routes": []
//           }
//         },
//         "measured": {
//           "width": 287,
//           "height": 191
//         },
//         "selected": false,
//         "dragging": false
//       },
//       {
//         "id": "agent-1753804000344",
//         "type": "editableNode",
//         "position": {
//           "x": 780,
//           "y": 705
//         },
//         "data": {
//           "id": "agent-mdopmbfc-orvzb",
//           "type": "agent",
//           "name": "Dr Eric agent",
//           "description": "An intelligent agent to process tasks",
//           "formData": {
//             "system_prompt": "Dr eric agent"
//           },
//           "width": 200,
//           "height": 50,
//           "Icon": {},
//           "form": {
//             "key": null,
//             "props": {},
//             "_owner": null,
//             "_store": {}
//           },
//           "color": "purple-600",
//           "defaultFormData": {
//             "system_prompt": ""
//           }
//         },
//         "measured": {
//           "width": 258,
//           "height": 175
//         },
//         "selected": false,
//         "dragging": false
//       }
//     ],
//     "edges": [
//       {
//         "style": {
//           "stroke": "#3B82F6",
//           "strokeWidth": 4
//         },
//         "markerEnd": {
//           "type": "arrowclosed",
//           "width": 10,
//           "height": 10,
//           "color": "#9375FA"
//         },
//         "source": "agent-mdop5irq-2inn5",
//         "sourceHandle": "tools",
//         "target": "api-1753803468102",
//         "targetHandle": "input",
//         "animated": true,
//         "id": "xy-edge__agent-mdop5irq-2inn5tools-api-1753803468102input"
//       },
//       {
//         "style": {
//           "stroke": "#3B82F6",
//           "strokeWidth": 4
//         },
//         "markerEnd": {
//           "type": "arrowclosed",
//           "width": 10,
//           "height": 10,
//           "color": "#9375FA"
//         },
//         "source": "agent-mdop5irq-2inn5",
//         "sourceHandle": "output",
//         "target": "end-1753803541773",
//         "targetHandle": "input",
//         "animated": true,
//         "id": "xy-edge__agent-mdop5irq-2inn5output-end-1753803541773input"
//       },
//       {
//         "style": {
//           "stroke": "#3B82F6",
//           "strokeWidth": 4
//         },
//         "markerEnd": {
//           "type": "arrowclosed",
//           "width": 10,
//           "height": 10,
//           "color": "#9375FA"
//         },
//         "source": "start-mdop5irq-bkyy5",
//         "target": "router-1753803950396",
//         "sourceHandle": "source",
//         "targetHandle": "input",
//         "animated": true,
//         "selected": false,
//         "id": "xy-edge__start-mdop5irq-bkyy5source-router-1753803950396input"
//       },
//       {
//         "style": {
//           "stroke": "#3B82F6",
//           "strokeWidth": 4
//         },
//         "markerEnd": {
//           "type": "arrowclosed",
//           "width": 10,
//           "height": 10,
//           "color": "#9375FA"
//         },
//         "source": "router-1753803950396",
//         "sourceHandle": "choice-0",
//         "target": "agent-mdop5irq-2inn5",
//         "targetHandle": "input",
//         "animated": true,
//         "id": "xy-edge__router-1753803950396choice-0-agent-mdop5irq-2inn5input"
//       },
//       {
//         "style": {
//           "stroke": "#3B82F6",
//           "strokeWidth": 4
//         },
//         "markerEnd": {
//           "type": "arrowclosed",
//           "width": 10,
//           "height": 10,
//           "color": "#9375FA"
//         },
//         "source": "router-1753803950396",
//         "sourceHandle": "choice-1",
//         "target": "agent-1753804000344",
//         "targetHandle": "input",
//         "animated": true,
//         "id": "xy-edge__router-1753803950396choice-1-agent-1753804000344input"
//       },
//       {
//         "style": {
//           "stroke": "#3B82F6",
//           "strokeWidth": 4
//         },
//         "markerEnd": {
//           "type": "arrowclosed",
//           "width": 10,
//           "height": 10,
//           "color": "#9375FA"
//         },
//         "source": "agent-1753804000344",
//         "sourceHandle": "output",
//         "target": "end-1753803541773",
//         "targetHandle": "input",
//         "animated": true,
//         "id": "xy-edge__agent-1753804000344output-end-1753803541773input"
//       }
//     ]
//   }
// }

import {
  Edge,
} from "@xyflow/react";
import { CustomNode } from "./canvas"
export const edgeStart: Edge[] = [
      {
        "style": {
          "stroke": "#3B82F6",
          "strokeWidth": 4
        },
        "source": "agent-mdop5irq-2inn5",
        "sourceHandle": "tools",
        "target": "api-1753803468102",
        "targetHandle": "input",
        "animated": true,
        "id": "xy-edge__agent-mdop5irq-2inn5tools-api-1753803468102input"
      },
      {
        "style": {
          "stroke": "#3B82F6",
          "strokeWidth": 4
        },
        "source": "agent-mdop5irq-2inn5",
        "sourceHandle": "output",
        "target": "end-1753803541773",
        "targetHandle": "input",
        "animated": true,
        "id": "xy-edge__agent-mdop5irq-2inn5output-end-1753803541773input"
      },
      {
        "style": {
          "stroke": "#3B82F6",
          "strokeWidth": 4
        },
        "source": "start-mdop5irq-bkyy5",
        "target": "router-1753803950396",
        "sourceHandle": "source",
        "targetHandle": "input",
        "animated": true,
        "selected": false,
        "id": "xy-edge__start-mdop5irq-bkyy5source-router-1753803950396input"
      },
      {
        "style": {
          "stroke": "#3B82F6",
          "strokeWidth": 4
        },
        "source": "router-1753803950396",
        "sourceHandle": "choice-0",
        "target": "agent-mdop5irq-2inn5",
        "targetHandle": "input",
        "animated": true,
        "id": "xy-edge__router-1753803950396choice-0-agent-mdop5irq-2inn5input"
      },
      {
        "style": {
          "stroke": "#3B82F6",
          "strokeWidth": 4
        },
        "source": "router-1753803950396",
        "sourceHandle": "choice-1",
        "target": "agent-1753804000344",
        "targetHandle": "input",
        "animated": true,
        "id": "xy-edge__router-1753803950396choice-1-agent-1753804000344input"
      },
      {
        "style": {
          "stroke": "#3B82F6",
          "strokeWidth": 4
        },
        "source": "agent-1753804000344",
        "sourceHandle": "output",
        "target": "end-1753803541773",
        "targetHandle": "input",
        "animated": true,
        "id": "xy-edge__agent-1753804000344output-end-1753803541773input"
      }
    ]

export const nodeStart: CustomNode[] =  [
      {
        "id": "start-mdop5irq-bkyy5",
        "type": "editableNode",
        "position": {
          "x": -345,
          "y": 60
        },
        "data": {
          "id": "start-mdop5irq-bkyy5",
          "type": "start",
          "formData": {},
          "name": "Start",
          "description": "An initial node to start your workflow",
          "width": 200,
          "height": 50,
          "color": "green-600"
        },
        "measured": {
          "width": 263,
          "height": 175
        },
        "selected": false,
        "dragging": false
      },
      {
        "id": "agent-mdop5irq-2inn5",
        "type": "editableNode",
        "position": {
          "x": 795,
          "y": -60
        },
        "data": {
          "id": "agent-mdop5irq-2inn5",
          "type": "agent",
          "formData": {
            "system_prompt": "e"
          },
          "name": "Products Agent",
          "description": "An intelligent agent to process tasks",
          "width": 200,
          "height": 50,
          "color": "purple-600",
          "defaultFormData": {
            "system_prompt": ""
          }
        },
        "measured": {
          "width": 270,
          "height": 175
        },
        "selected": false,
        "dragging": false
      },
      {
        "id": "api-1753803468102",
        "type": "editableNode",
        "position": {
          "x": 765,
          "y": 450
        },
        "data": {
          "id": "api-mdopawqu-4lj6x",
          "type": "api",
          "name": "API",
          "description": "A node to configure API calls for your workflow",
          "formData": {
            "tool_type": "api",
            "schema": {
              "type": "function",
              "function": {
                "name": "web_search",
                "description": "Search the web for a given query",
                "parameters": {
                  "type": "object",
                  "properties": {
                    "query": {
                      "type": "string",
                      "description": "Search query to retrieve relevant information."
                    }
                  },
                  "required": [
                    "query"
                  ],
                  "additionalProperties": false
                },
                "strict": false
              }
            },
            "execution": {
              "method": "GET",
              "url": "https://dummyjson.com/products/search?q={{query}}",
              "timeout": 30,
              "retries": 3
            }
          },
          "width": 200,
          "height": 50,
          "color": "red-600",
          "defaultFormData": {
            "toolType": "api",
            "configuration": {
              "endpoint": "",
              "method": "GET",
              "authentication": "none",
              "headers": {},
              "timeout": 30,
              "retries": 3
            },
            "inputSchema": "",
            "outputSchema": "",
            "testConfig": {
              "enabled": false,
              "sampleInput": "",
              "expectedOutput": ""
            }
          }
        },
        "measured": {
          "width": 316,
          "height": 175
        },
        "selected": false,
        "dragging": false
      },
      {
        "id": "end-1753803541773",
        "type": "editableNode",
        "position": {
          "x": 1365,
          "y": -45
        },
        "data": {
          "id": "end-mdopchl9-4ksu2",
          "type": "end",
          "name": "End",
          "description": "An end node to terminate your workflow",
          "formData": {},
          "width": 200,
          "height": 50,
          "color": "red-600"
        },
        "measured": {
          "width": 282,
          "height": 175
        },
        "selected": false,
        "dragging": false
      },
      {
        "id": "router-1753803950396",
        "type": "editableNode",
        "position": {
          "x": 135,
          "y": 0
        },
        "data": {
          "id": "router-mdopl8vx-u2zkc",
          "type": "router",
          "name": "Router",
          "description": "A node to route data based on conditions",
          "formData": {
            "system_prompt": "dr eric or not",
            "routes": [
              {
                "choice": "dr eric",
                "target_agent": "agent-mdop5irq-2inn5",
                "id": "1753803966050"
              },
              {
                "choice": "products",
                "target_agent": "agent-1753804000344",
                "id": "1753803973846"
              }
            ]
          },
          "width": 200,
          "height": 50,
          "color": "yellow-600",
          "defaultFormData": {
            "system_prompt": "",
            "routes": []
          }
        },
        "measured": {
          "width": 287,
          "height": 191
        },
        "selected": false,
        "dragging": false
      },
      {
        "id": "agent-1753804000344",
        "type": "editableNode",
        "position": {
          "x": 780,
          "y": 705
        },
        "data": {
          "id": "agent-mdopmbfc-orvzb",
          "type": "agent",
          "name": "Dr Eric agent",
          "description": "An intelligent agent to process tasks",
          "formData": {
            "system_prompt": "Dr eric agent"
          },
          "width": 200,
          "height": 50,
          "color": "purple-600",
          "defaultFormData": {
            "system_prompt": ""
          }
        },
        "measured": {
          "width": 258,
          "height": 175
        },
        "selected": false,
        "dragging": false
      }
    ]
