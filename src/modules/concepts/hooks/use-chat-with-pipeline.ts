import { useState, useCallback } from 'react';
import { AnswerUsingPipelineResponse } from '../apollo/mutation/pipeline';
import { useCanvasFlow } from '../store/react-flow-store';
import { toast } from '@/core/hooks/use-toast';
import { UpdatePipelineFlowInput } from '../types/api/pipeline';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { StreamEvent, TokenEvent, isTokenEvent, isFinalResponseEvent } from '../types/api/pipeline-events';
import { useAuth } from '@/core/providers/auth';
import { useReactFlow } from '@xyflow/react';
// Utility function to recursively remove __typename from objects
const removeTypename = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (key !== '__typename') {
        newObj[key] = removeTypename(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
};

export const useChatWithPipeline = () => {
  const {
    nodes,
    edges,
    pipelineId,
  } = useCanvasFlow();
  const { token: authToken } = useAuth(); // Move useAuth to top level
  const [threadId, setThreadId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineEvents, setPipelineEvents] = useState<StreamEvent[]>([]);
  const { setNodes } = useReactFlow();
  // SSE-based pipeline execution function
  const callPipelineSSEConnection = useCallback((
    flowData: UpdatePipelineFlowInput,
    userMessage: string,
    threadId?: string,
    onFinalResponse?: (response: AnswerUsingPipelineResponse) => void,
    onError?: (error: Error) => void
  ) => 
    {
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL!;
    const controller = new AbortController();

    // Event batching for pipeline token events
    let eventBatch: TokenEvent[] = [];
    let batchTimer: NodeJS.Timeout | null = null;
    // Remove the useAuth call from here - use the authToken from closure
    const processBatch = () => {
      if (eventBatch.length > 0) {
        console.log('Processing event batch:', eventBatch);
        setPipelineEvents((prevPipelineEvents) => {
          // Only use TokenEvent for batching
          let concatenateEvents: TokenEvent[] = prevPipelineEvents as TokenEvent[];
          console.log('Current pipelineEvents before batch processing:', concatenateEvents);
          for (const tokenPayload of eventBatch) {
            let lastEventIndex = concatenateEvents.length - 1;
            let lastEvent = concatenateEvents[lastEventIndex];

            // If last event is from the same node, concatenate content
            if (lastEvent && lastEvent.node === tokenPayload.node) {
              concatenateEvents[lastEventIndex] = {
                ...tokenPayload,
                content: lastEvent.content + tokenPayload.content,
                // Merge tool_call arrays if both have tool calls
                tool_call: [...lastEvent.tool_call, ...tokenPayload.tool_call],
              };
            } else {
              concatenateEvents.push(tokenPayload);
            }
          }
          console.log('new Concatenated Events:', concatenateEvents);
          const eventsNodesIds = concatenateEvents.map(ev => ev.node);
          const lastEventNodeId = eventsNodesIds[eventsNodesIds.length - 1];
          setNodes((currentNodes) => 
            currentNodes.map((node) => {
              if (eventsNodesIds.includes(node.id)) {
                const event = concatenateEvents.find(ev => ev.node === node.id)!;
                return {
                  ...node,
                  data: {
                    ...node.data,
                    streaming_details: {
                      content: event.content,
                      tool_call: event.tool_call,
                      metadata: event.metadata,
                      streaming: lastEventNodeId === node.id,
                      lastUpdate: Date.now(),
                    }
                  }
                };
              } if (node.id.startsWith('start-')) {
                // Remove streaming details for start nodes
                return {
                  ...node,
                  data: {
                    ...node.data,
                    streaming_details: {
                      streaming: false,
                    }
                  }
                };
              }
              return node;
            })
          );
          eventBatch = [];
          return [...concatenateEvents];
        });
      }
      batchTimer = null;
    };

    const addEventToBatch = (tokenPayload: TokenEvent) => {
      eventBatch.push(tokenPayload);
      if (!batchTimer) batchTimer = setTimeout(processBatch, 50);
    };
    setPipelineEvents([]); // Clear previous events
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id.startsWith('start-'))
          return {
            ...node,
            data: {
              ...node.data,
              streaming_details: {
                streaming: true,
              },
            }
          };
        
        return {
        ...node,
        data: {
          ...node.data,
          streaming_details: undefined
        }
      }})
    );
    fetchEventSource(`${baseApiUrl}/ai-pipeline/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: JSON.stringify({
        flowData,
        content: userMessage,
        threadId,
      }),
      signal: controller.signal,

      openWhenHidden: true,
      async onopen(res) {
        if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
          console.log('Pipeline SSE connection opened.');
          return;
        }
        throw new Error(`Unexpected response: ${res.status} ${res.statusText}`);
      },      
      onmessage(msg) {
        try {
          const parsed = JSON.parse(msg.data) as StreamEvent;          // Handle final event (pipeline completion)
          if (isFinalResponseEvent(parsed)) {
            if (batchTimer) { clearTimeout(batchTimer); processBatch(); }
            
            // Handle final response - compatible with AnswerUsingPipelineResponse
            const finalResponse: AnswerUsingPipelineResponse = {
              statusCode: 200,
              message: "que bom",
              response: parsed.content,
              lastNodeId: parsed.last_node_id,
              toolCalls: [], // Tool calls would be extracted from token events if needed
              timeTaken: 0,
              threadId: threadId, // Keep existing threadId or extract from response if available
            };

            // Show success toast with timing information
            toast({
              title: "Pipeline Response Received",
              description: `Response processed in ${finalResponse.timeTaken}s`,
              variant: "default",
            });

            setIsProcessing(false);
            controller.abort();
            
            // Call the callback with final response
            if (onFinalResponse) {
              setNodes((currentNodes) =>
                currentNodes.map((node) => {
                  if (node.data.streaming_details) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        streaming_details: {
                          ...node.data.streaming_details,
                          streaming: false,
                        },
                      }
                    };
                  }
                  return node;
                })
              );
              onFinalResponse(finalResponse);
            }
            return;
          }

          if (isTokenEvent(parsed)) {
            addEventToBatch(parsed);
          }        
        } catch (e) {
          console.error('Error parsing Pipeline SSE event:', e);
          if (onError) {
            onError(new Error('Error parsing Pipeline SSE event'));
          }
        }
      },      
      onerror(err) {
        console.error('Pipeline SSE Error:', err);
        if (batchTimer) { clearTimeout(batchTimer); processBatch(); }
        setIsProcessing(false);
        
        toast({
          title: "Pipeline Error",
          description: "Failed to process pipeline execution",
          variant: "destructive",
        });
        
        if (onError) {
          onError(new Error('Failed to process pipeline execution'));
        }
        controller.abort();
      },
    });    // Return a handle to stop streaming
    return {
      stop: () => {
        if (batchTimer) { clearTimeout(batchTimer); processBatch(); }
        controller.abort();
        setIsProcessing(false);
      },
    };
  }, [authToken]); // Add authToken to dependencies
  const sendMessageToPipeline = useCallback(async (userMessage: string): Promise<AnswerUsingPipelineResponse | null> => {
    if (!pipelineId) {
      toast({
        title: "Error",
        description: "No pipeline ID available for chat",
        variant: "destructive",
      });
      return null;
    }

    if (!userMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return null;
    }    
    
    return new Promise((resolve, reject) => {
      try {
        setIsProcessing(true);
        setPipelineEvents([]); // Clear previous events

      // Transform nodes and edges to match the expected format and remove __typename
      const transformedNodes = nodes.map(node => {
        const cleanNode = removeTypename(node);
        return {
          id: cleanNode.id,
          type: cleanNode.type || 'default',
          position: cleanNode.position,
          data: {
            id: cleanNode.data?.id || cleanNode.id,
            type: cleanNode.data?.type || cleanNode.type || 'default',
            name: cleanNode.data?.name || 'Unnamed Node',
            description: cleanNode.data?.description || 'No description',
            color: cleanNode.data?.color,
            isEditingName: cleanNode.data?.isEditingName || false,
            isEditingDescription: cleanNode.data?.isEditingDescription || false,
            formData: cleanNode.data?.formData,
            additionalData: cleanNode.data?.additionalData,
            input_variables: cleanNode.data?.input_variables || [],
          },
          measured: cleanNode.measured ? {
            width: cleanNode.measured.width || 0,
            height: cleanNode.measured.height || 0,
          } : undefined,
          selected: cleanNode.selected,
          dragging: cleanNode.dragging,
        };
      });

      const transformedEdges = edges.map(edge => {
        const cleanEdge = removeTypename(edge);
        return {
          id: cleanEdge.id,
          source: cleanEdge.source,
          target: cleanEdge.target,
          sourceHandle: cleanEdge.sourceHandle === null ? undefined : cleanEdge.sourceHandle,
          targetHandle: cleanEdge.targetHandle === null ? undefined : cleanEdge.targetHandle,
          style: cleanEdge.style ? {
            stroke: cleanEdge.style.stroke,
            strokeWidth: cleanEdge.style.strokeWidth,
          } : undefined,
          animated: cleanEdge.animated,
          selected: cleanEdge.selected,
        };
      });      const flowData: UpdatePipelineFlowInput = {
        nodes: transformedNodes,
        edges: transformedEdges,
      };
      
      // Start SSE connection for pipeline execution
      callPipelineSSEConnection(
        flowData, 
        userMessage.trim(), 
        threadId,
        (finalResponse) => {
          // Store the threadId from the response for future calls
          if (finalResponse.threadId) {
            setThreadId(finalResponse.threadId);
          }
          setPipelineEvents([]);
          resolve(finalResponse);

        },
        (error) => {
          setIsProcessing(false);
          reject(error);
        }
      );

    } catch (error: any) {
      console.error('Error sending message to pipeline:', error);
      setIsProcessing(false);
      
      toast({
        title: "Pipeline Error",
        description: error.message || "Failed to process message through pipeline",
        variant: "destructive",
      });
      
      reject(error);
    }
    });
  }, [pipelineId, nodes, edges, threadId, callPipelineSSEConnection]);
  const resetThread = useCallback(() => {
    setThreadId(undefined);
    setPipelineEvents([]);
  }, []);

  return {
    sendMessageToPipeline,
    isProcessing,
    threadId,
    resetThread,
    pipelineEvents, // Expose streaming pipeline events for UI consumption during pipeline execution
  };
};
