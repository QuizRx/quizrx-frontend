import { apolloClientInstance } from "@/core/providers/apollo-wrapper";
import { useAuth } from "@/core/providers/auth";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SEND_MESSAGE_MUTATION } from "../apollo/mutation/chat";
import { CREATE_THREAD_MUTATION } from "../apollo/mutation/thread";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  GET_USER_THREAD_MESSAGES_QUERY,
  GET_USER_THREADS_QUERY,
} from "../apollo/query/thread";
import { Message, SenderType, MessageType } from "../types/api/messages";
import { Thread } from "../types/api/thread";
import {
  AgentEvent,
  isLLMStreamingEvent,
  isToolCallingEvent,
  LLMStreamingEvent,
  ToolCallingEvent,
  isEndEvent,
  isFinalResponseEvent,
  StreamBucket,
} from "../types/api/events";

// Define the state shape
interface ChatState {
  isChatStarted: boolean;
  messages: Message[];
  isLoading: boolean;
  currentThread: Thread | null;
  availableThreads: Thread[];
  isLoadingThreadList: boolean;
  lastStreamingMessageId: string | null;
  isStreaming: boolean;
  // Store agent events for streaming
  agentEvents: AgentEvent[];
  streamsById: Record<string, StreamBucket>;
  streamOrder: string[]; // preserve order of stream_opened
  lastBatchThreadId: string | null;
}

// Define actions that can be performed on the state
interface ChatActions {
  startChat: () => void;
  addMessage: (message: Message) => void;
  handleMessageAction: (
    action: "like" | "unlike" | "download" | "copy" | "rewrite",
    messageId: string
  ) => void;
  handleSubmit: (message: string, authToken?: string) => void;
  resetChat: () => void;
  createThread: (
    initialMessage: string,
    title?: string,
    description?: string,
    authToken?: string
  ) => Promise<void>;
  fetchAvailableThreads: () => Promise<void>;
  loadThread: (threadId: string) => Promise<void>;
  setLastStreamingMessageId: (messageId: string | null) => void;
  addAgentEvent: (event: AgentEvent) => void;
  addAgentEvents: (events: AgentEvent[]) => void;
  callSSEConnection: (args: {
    threadId: string;
    message: string;
    authToken?: string;
    aiMessageId: string;
    onContent?: (content: string) => void;
    onDone?: () => void;
  }) => EventSource;

  openStreamBucket: (meta: {
    streamId: string;
    macroTitle?: string;
    subtopicTitle?: string;
  }) => void;
  pushStreamEvent: (streamId: string, ev: AgentEvent) => void;
  finishStreamBucket: (streamId: string, status?: "done" | "error") => void;
  clearStreams: () => void;
  SSEMultiConnection: (args: {
    topics: {
      topicId: string;
      allSubtopics?: boolean;
      subTopicsIds?: string[];
    }[];
    authToken: string;
    onThreadReady?: (threadId: string) => void;
    onEachFinalResponse?: (payload: { streamId: string; message: any }) => void;
  }) => { stop: () => void };
  startFormTopicStreaming: (
    topics: {
      topicId: string;
      allSubtopics?: boolean;
      subTopicsIds?: string[];
    }[],
    authToken: string,
    onThreadReady?: (threadId: string) => void
  ) => void;
}

// Helper function to get the Apollo client safely
const getApolloClient = () => {
  // First try the imported instance
  if (apolloClientInstance) {
    return apolloClientInstance;
  }

  // Fallback to window.apolloClient if available
  if (typeof window !== "undefined" && window.apolloClient) {
    return window.apolloClient;
  }

  throw new Error(
    "Apollo client is not initialized yet. Please ensure authentication is complete."
  );
};

// Create the store
export const useChatStore = create<ChatState & ChatActions & {}>()(
  devtools((set, get) => {
    // Animation function for content updates
    function updateContentWithAnimation(
      streamingMessageId: string,
      messageData: Message
    ) {
      const fullContent = messageData.content || "";
      if (!fullContent) {
        return;
      }
      // First, update the message with all properties except content
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === streamingMessageId
            ? { ...msg, ...messageData, content: "" } // Initialize with empty content for animation
            : msg
        ),
      }));

      // Then animate the content by chunks
      const chunkSize = 8; // You can adjust chunk size for animation speed
      let currentIndex = 0;

      function animateContent() {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === streamingMessageId
              ? { ...msg, content: fullContent.slice(0, currentIndex) }
              : msg
          ),
        }));

        currentIndex += chunkSize;

        if (currentIndex < fullContent.length) {
          setTimeout(animateContent, 30); // Adjust delay for animation speed
        } else {
          // Ensure the full content is set at the end
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === streamingMessageId
                ? { ...msg, content: fullContent }
                : msg
            ),
          }));
        }
      }

      // Start the animation
      animateContent();
    }

    // Modular SSE connection function
    function callSSEConnection(
      threadId: string,
      message: string,
      authToken: string | undefined
    ) {
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL!;
      const controller = new AbortController();

      // keep your batching
      let eventBatch: AgentEvent[] = [];
      let batchTimer: NodeJS.Timeout | null = null;

      const processBatch = () => {
        if (eventBatch.length > 0) {
          get().addAgentEvents(eventBatch);
          eventBatch = [];
        }
        batchTimer = null;
      };

      const addEventToBatch = (ev: AgentEvent) => {
        eventBatch.push(ev);
        if (!batchTimer) batchTimer = setTimeout(processBatch, 50);
      };

      fetchEventSource(`${baseApiUrl}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          threadId,
          content: message,
        }),
        signal: controller.signal,

        openWhenHidden: true, // optional: keep streaming if tab hidden
        async onopen(res) {
          if (
            res.ok &&
            res.headers.get("content-type")?.includes("text/event-stream")
          ) {
            return;
          }
          throw new Error(
            `Unexpected response: ${res.status} ${res.statusText}`
          );
        },

        onmessage(msg) {
          try {
            const parsed = JSON.parse(msg.data) as AgentEvent;

            if (isEndEvent(parsed)) {
              if (batchTimer) {
                clearTimeout(batchTimer);
                processBatch();
              }
              set({
                isStreaming: false,
                lastStreamingMessageId: null,
                agentEvents: [],
              });
              controller.abort(); // stop reading stream
              return;
            }

            if (isFinalResponseEvent(parsed)) {
              if (batchTimer) {
                clearTimeout(batchTimer);
                processBatch();
              }

              const t = parsed.message.messageType;
              if (t === MessageType.ANSWER) {
                set((state) => ({
                  messages: [
                    ...state.messages,
                    { ...parsed.message, content: "" },
                  ],
                }));
                updateContentWithAnimation(parsed.message._id, parsed.message);
              } else if (t === MessageType.QUIZ) {
                set((state) => ({
                  messages: [...state.messages, parsed.message],
                }));
              }
              set((state) => ({ agentEvents: [] }));
              return;
            }

            addEventToBatch(parsed);
          } catch (e) {
            console.error("SSE parse error:", e);
            set((state) => ({ agentEvents: [] }));
          }
        },

        onerror(err) {
          console.error("SSE error:", err);
          if (batchTimer) {
            clearTimeout(batchTimer);
            processBatch();
          }
          set({
            isStreaming: false,
            lastStreamingMessageId: null,
            agentEvents: [],
          });
          // Returning nothing keeps the connection closed.
        },
      });

      // Return a handle so caller can stop streaming (like ChatGPT’s “Stop generating”)
      return {
        stop: () => {
          if (batchTimer) {
            clearTimeout(batchTimer);
            processBatch();
          }
          controller.abort();
          set({
            isStreaming: false,
            lastStreamingMessageId: null,
            agentEvents: [],
          });
        },
      };
    }
    function ensureTs<T extends object>(obj: T): T & { timestamp: number } {
      return "timestamp" in obj
        ? (obj as any)
        : { ...(obj as any), timestamp: Math.floor(Date.now() / 1000) };
    }
    // Create the store with initial state and actions
    return {
      // Initial state
      isChatStarted: false,
      messages: [],
      isLoading: false,
      currentThread: null,
      availableThreads: [],
      isLoadingThreadList: false,
      lastStreamingMessageId: null,
      isStreaming: false,
      agentEvents: [], // Actions
      addAgentEvent: (event: AgentEvent) =>
        set((state) => {
          // Use the provided logic to update agentEvents
          const concatenateEvents = [...state.agentEvents];
          let lastEventIndex = concatenateEvents.length - 1;
          let lastEvent = concatenateEvents[lastEventIndex];
          const eventData = event;
          if (lastEvent && lastEvent.event === eventData.event) {
            if (
              isLLMStreamingEvent(eventData) &&
              isLLMStreamingEvent(lastEvent) &&
              lastEvent.node === eventData.node
            ) {
              // Type guard for LLMStreamingEvent
              const prev = concatenateEvents[
                lastEventIndex
              ] as LLMStreamingEvent;
              const curr = eventData as LLMStreamingEvent;
              concatenateEvents[lastEventIndex] = {
                ...curr,
                content: prev.content + curr.content,
              };
            } else if (isToolCallingEvent(eventData)) {
              // Type guard for ToolCallingEvent
              const prev = concatenateEvents[
                lastEventIndex
              ] as ToolCallingEvent;
              const curr = eventData as ToolCallingEvent;
              concatenateEvents[lastEventIndex] = {
                ...curr,
                data: prev.data + "\n" + curr.data,
              };
              lastEvent = eventData;
            } else {
              concatenateEvents.push(eventData);
              lastEvent = eventData;
              lastEventIndex = concatenateEvents.length - 1;
            }
          } else {
            concatenateEvents.push(eventData);
            lastEvent = eventData;
            lastEventIndex = concatenateEvents.length - 1;
          }
          return { agentEvents: concatenateEvents };
        }),

      addAgentEvents: (events: AgentEvent[]) =>
        set((state) => {
          // Process multiple events in batch to reduce re-renders
          let concatenateEvents = [...state.agentEvents];

          for (const event of events) {
            let lastEventIndex = concatenateEvents.length - 1;
            let lastEvent = concatenateEvents[lastEventIndex];
            const eventData = event;

            if (lastEvent && lastEvent.event === eventData.event) {
              if (
                isLLMStreamingEvent(eventData) &&
                isLLMStreamingEvent(lastEvent) &&
                lastEvent.node === eventData.node
              ) {
                // Type guard for LLMStreamingEvent
                const prev = concatenateEvents[
                  lastEventIndex
                ] as LLMStreamingEvent;
                const curr = eventData as LLMStreamingEvent;
                concatenateEvents[lastEventIndex] = {
                  ...curr,
                  content: prev.content + curr.content,
                };
              } else if (isToolCallingEvent(eventData)) {
                // Type guard for ToolCallingEvent
                const prev = concatenateEvents[
                  lastEventIndex
                ] as ToolCallingEvent;
                const curr = eventData as ToolCallingEvent;
                concatenateEvents[lastEventIndex] = {
                  ...curr,
                  data: prev.data + "\n" + curr.data,
                };
                lastEvent = eventData;
              } else {
                concatenateEvents.push(eventData);
                lastEvent = eventData;
                lastEventIndex = concatenateEvents.length - 1;
              }
            } else {
              concatenateEvents.push(eventData);
              lastEvent = eventData;
              lastEventIndex = concatenateEvents.length - 1;
            }
          }

          return { agentEvents: concatenateEvents };
        }),
      startChat: () => set({ isChatStarted: true }),

      addMessage: (message: Message) =>
        set((state) => ({
          messages: [...state.messages, message],
          // If this is an AI message, mark it for streaming
          lastStreamingMessageId:
            message.senderType === SenderType.AI
              ? message._id
              : state.lastStreamingMessageId,
        })),

      setLastStreamingMessageId: (messageId: string | null) =>
        set({ lastStreamingMessageId: messageId }),

      handleMessageAction: (
        action: "like" | "unlike" | "download" | "copy" | "rewrite",
        messageId: string
      ) => {
        console.log(`Action ${action} on message ${messageId}`);

        // Implement functionality based on action type
        switch (action) {
          case "like":
            // Like functionality
            break;
          case "unlike":
            // Unlike functionality
            break;
          case "download":
            // Download message content
            const message = get().messages.find((m) => m._id === messageId);
            if (message && message.content) {
              const blob = new Blob([message.content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `message-${new Date()
                .toISOString()
                .slice(0, 10)}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
            break;
          case "copy":
            // Copy message to clipboard
            const content =
              get().messages.find((m) => m._id === messageId)?.content || "";
            navigator.clipboard.writeText(content);
            break;
          case "rewrite":
            // Rewrite functionality - would require additional API integration
            break;
        }
      },

      handleSubmit: async (message: string, authToken?: string) => {
        try {
          if (!get().isChatStarted) {
            set({ isChatStarted: true });
          }

          const threadId = get().currentThread?._id;
          if (!threadId) {
            try {
              const eventCreatingThread: LLMStreamingEvent = {
                event: "llm_streaming",
                node: "creating_thread",
                content: "Creating new thread...",
                timestamp: Date.now() / 1000, // Convert to Unix timestamp
              };
              get().addAgentEvent(eventCreatingThread);
              set({ isStreaming: true });
              await get().createThread(
                message,
                undefined,
                undefined,
                authToken
              );
              return;
            } catch (error) {
              console.error("Error creating thread:", error);
              set({ isLoading: false });
              return;
            }
          }

          // Add user message immediately and ensure UI updates
          const userMessage: Message = {
            _id: `user-${Date.now()}`,
            content: message,
            senderType: SenderType.USER,
            messageType: MessageType.QUERY,
            threadId: threadId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Update state with user message first
          set((state) => ({
            messages: [...state.messages, userMessage],
            isLoading: true,
          }));

          // Small delay to ensure UI updates with user message
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Add empty AI message for streaming

          set((state) => ({
            isStreaming: true,
            isLoading: false,
          }));

          // Start modular SSE connection
          callSSEConnection(threadId, message, authToken);
        } catch (error) {
          console.error("Error in handleSubmit:", error);
          set({ isLoading: false, isStreaming: false });
        }
      },

      resetChat: () =>
        set({
          messages: [],
          isChatStarted: false,
          currentThread: null,
          lastStreamingMessageId: null,
          isStreaming: false,
          agentEvents: [],
          streamsById: {},
          streamOrder: [],
          lastBatchThreadId: null,
          isLoading: false,
          isLoadingThreadList: false,
        }),

      createThread: async (
        initialMessage: string,
        title?: string,
        description?: string,
        authToken?: string
      ) => {
        try {
          set({ isLoading: true });

          // Add user message immediately before API call
          const tempUserMessage: Message = {
            _id: `user-${Date.now()}`,
            content: initialMessage,
            senderType: SenderType.USER,
            messageType: MessageType.QUERY,
            threadId: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Update state with user message first
          set((state) => ({
            messages: [tempUserMessage],
            isChatStarted: true,
          }));

          const client = getApolloClient();

          const result = await client.mutate({
            mutation: CREATE_THREAD_MUTATION,
            variables: {
              createThreadInput: {
                initialMessage,
                title,
                description,
              },
            },
          });

          if (result.data?.createThread) {
            const newThread = result.data.createThread as Thread;

            // Update local state with the new thread
            set((state) => ({
              currentThread: newThread,
              isChatStarted: true,
              isLoading: false,
              // Update the temporary message with the real threadId
              messages: state.messages.map((msg) =>
                msg._id === tempUserMessage._id
                  ? { ...msg, threadId: newThread._id }
                  : msg
              ),
            }));

            // Add the new thread to availableThreads
            set((state) => ({
              availableThreads: [newThread, ...state.availableThreads],
            }));

            // Add empty AI message for streaming

            set((state) => ({
              isStreaming: true,
              isLoading: false,
            }));

            // Start modular SSE connection for initial message
            callSSEConnection(newThread._id, initialMessage, authToken);
          } else {
            throw new Error("Failed to create thread - no data returned");
          }
        } catch (error) {
          console.error("Error creating thread:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      fetchAvailableThreads: async () => {
        try {
          set({ isLoadingThreadList: true });

          const client = getApolloClient();
          const result = await client.query({
            query: GET_USER_THREADS_QUERY,
            variables: {
              pagination: {
                page: 1,
                limit: 20, // Adjust as needed
                orderBy: "desc",
              },
            },
            fetchPolicy: "cache-first", // Changed from network-only for better performance
          });

          if (result.data?.getUserThreads?.data) {
            set({
              availableThreads: result.data.getUserThreads.data,
              isLoadingThreadList: false,
            });
          } else {
            set({ isLoadingThreadList: false });
          }
        } catch (error) {
          console.error("Error fetching threads:", error);
          set({ isLoadingThreadList: false });
        }
      },

      loadThread: async (threadId: string) => {
        try {
          set({
            isLoading: true,
            lastStreamingMessageId: null, // Reset streaming when loading a thread
            messages: [],
            agentEvents: [],
            // Clear streams - they will be reconstructed from saved messages
            streamsById: {},
            streamOrder: [],
            isStreaming: false,
          });

          // First, find the thread in availableThreads if it exists
          const existingThread = get().availableThreads.find(
            (t) => t._id === threadId
          );

          const client = getApolloClient();

          if (existingThread) {
            set({ currentThread: existingThread });
          }

          // Then fetch all messages for this thread
          const result = await client.query({
            query: GET_USER_THREAD_MESSAGES_QUERY,
            variables: {
              threadId,
              pagination: {
                page: 1,
                limit: 50, // Adjust as needed
              },
            },
            // Removed fetchPolicy to use Apollo Client default (cache-first)
            errorPolicy: "all",
          });

          if (result.data?.getThreadMessages?.data) {
            const apiMessages = result.data.getThreadMessages.data as Message[];

            const parsedMessages = apiMessages.map((msg) => {
              if (
                msg.messageType === MessageType.QUIZ &&
                msg.questions &&
                Array.isArray(msg.questions)
              ) {
                const parsedQuestions = msg.questions.map((q: any) => {
                  if (q.explanation && typeof q.explanation === "string") {
                    try {
                      const parsed = JSON.parse(q.explanation);
                      if (
                        parsed &&
                        typeof parsed === "object" &&
                        ("correct_answer" in parsed ||
                          "distractors" in parsed ||
                          "key_points" in parsed)
                      ) {
                        return {
                          ...q,
                          explanation: parsed,
                        };
                      }
                    } catch (e) {
                      // Keep as string if parsing fails
                    }
                  }
                  return q;
                });

                return {
                  ...msg,
                  questions: parsedQuestions,
                };
              }
              return msg;
            });

            const updatedMessages = [...parsedMessages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );

            // Reconstruct streamsById and streamOrder from saved agentEvents
            const quizMessages = updatedMessages.filter(
              (m) =>
                m.messageType === MessageType.QUIZ &&
                m.questions &&
                Array.isArray(m.questions) &&
                m.questions.length > 0
            );

            if (quizMessages.length > 1) {
              // Multiple quiz messages - reconstruct streams
              const reconstructedStreamsById: Record<string, any> = {};
              const reconstructedStreamOrder: string[] = [];

              quizMessages.forEach((msg, index) => {
                const streamId = msg._id; // Use message ID as stream ID
                const question =
                  Array.isArray(msg.questions) && msg.questions.length > 0
                    ? msg.questions[0]
                    : null;

                reconstructedStreamsById[streamId] = {
                  streamId,
                  macroTitle: question?.topic || "Question",
                  subtopicTitle: question?.sub_topic || `Question ${index + 1}`,
                  status: "done",
                  events: msg.agentEvents || [],
                };
                reconstructedStreamOrder.push(streamId);
              });

              set({
                messages: updatedMessages,
                isLoading: false,
                isChatStarted: true,
                streamsById: reconstructedStreamsById,
                streamOrder: reconstructedStreamOrder,
              });
            } else {
              set({
                messages: updatedMessages,
                isLoading: false,
                isChatStarted: true,
              });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error loading thread:", error);
          set({ isLoading: false });
        }
      },
      openStreamBucket: ({ streamId, macroTitle, subtopicTitle }) =>
        set((state) => {
          if (state.streamsById[streamId]) return {}; // already exists
          return {
            streamsById: {
              ...state.streamsById,
              [streamId]: {
                streamId,
                macroTitle,
                subtopicTitle,
                status: "open",
                events: [],
              },
            },
            streamOrder: [...state.streamOrder, streamId],
          };
        }),

      // ─── NEW: push event into a bucket ───
      pushStreamEvent: (streamId, ev) =>
        set((state) => {
          const bucket = state.streamsById[streamId];
          if (!bucket) return {};

          const events = [...bucket.events];
          const lastEvent = events[events.length - 1];

          // Apply concatenation logic similar to backend
          if (
            isLLMStreamingEvent(ev) &&
            lastEvent &&
            isLLMStreamingEvent(lastEvent)
          ) {
            // Same node? Concatenate content
            if (lastEvent.node === ev.node) {
              events[events.length - 1] = {
                ...ev,
                content: (lastEvent.content || "") + (ev.content || ""),
              };
            } else {
              events.push(ev);
            }
          } else if (
            isToolCallingEvent(ev) &&
            lastEvent &&
            isToolCallingEvent(lastEvent)
          ) {
            // Same tool? Concatenate data
            if (lastEvent.tool_name === ev.tool_name) {
              events[events.length - 1] = {
                ...ev,
                data: (lastEvent.data || "") + (ev.data || ""),
              };
            } else {
              events.push(ev);
            }
          } else {
            // Different event type, just push
            events.push(ev);
          }

          return {
            streamsById: {
              ...state.streamsById,
              [streamId]: {
                ...bucket,
                events,
              },
            },
          };
        }),

      // ─── NEW: finish a bucket ───
      finishStreamBucket: (streamId, status = "done") =>
        set((state) => {
          const bucket = state.streamsById[streamId];
          if (!bucket) return {};
          return {
            streamsById: {
              ...state.streamsById,
              [streamId]: { ...bucket, status },
            },
          };
        }),

      // ─── NEW: clear all stream buckets ───
      clearStreams: () =>
        set({ streamsById: {}, streamOrder: [], lastBatchThreadId: null }),

      // ─── NEW: multi-stream SSE connection ───
      SSEMultiConnection: ({
        topics,
        authToken,
        onThreadReady,
        onEachFinalResponse,
      }) => {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL!;
        const controller = new AbortController();

        // batching (global — OK for lightweight UI hints)
        let eventBatch: AgentEvent[] = [];
        let batchTimer: NodeJS.Timeout | null = null;

        const processBatch = () => {
          if (eventBatch.length > 0) {
            get().addAgentEvents(eventBatch);
            eventBatch = [];
          }
          batchTimer = null;
        };
        const addEventToBatch = (ev: AgentEvent) => {
          eventBatch.push(ev);
          if (!batchTimer) batchTimer = setTimeout(processBatch, 50);
        };

        // Start streaming
        fetchEventSource(`${baseApiUrl}/chat/form-topic/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ topics: topics }),
          signal: controller.signal,
          openWhenHidden: true,

          async onopen(res) {
            if (
              res.ok &&
              res.headers.get("content-type")?.includes("text/event-stream")
            ) {
              // Prepare UI
              set({ isStreaming: true });
              return;
            }
            throw new Error(
              `Unexpected response: ${res.status} ${res.statusText}`
            );
          },

          onmessage(msg) {
            try {
              const raw = JSON.parse(msg.data);
              const hasStream = !!raw.stream_id;
              const ev = ensureTs(raw) as AgentEvent;

              // 1) stream_opened → create bucket
              if (ev.event === "stream_opened" && hasStream) {
                get().openStreamBucket({
                  streamId: raw.stream_id,
                  macroTitle: raw.macro_title,
                  subtopicTitle: raw.subtopic_title,
                });
                addEventToBatch(ev);
                return;
              }

              // 2) Normal streaming events (llm_streaming, tool_calling)
              if (
                hasStream &&
                (ev.event === "llm_streaming" || ev.event === "tool_calling")
              ) {
                get().pushStreamEvent(raw.stream_id, ev);
                addEventToBatch(ev);
                return;
              }

              // 3) final_response → store per bucket; optional hook
              if (isFinalResponseEvent(ev)) {
                if (hasStream) {
                  get().pushStreamEvent(raw.stream_id, ev);
                  onEachFinalResponse?.({
                    streamId: raw.stream_id,
                    message: (ev as any).message,
                  });
                } else {
                  // fallback: single-stream UI
                  addEventToBatch(ev);
                }
                return;
              }

              // 4) done per stream
              if (ev.event === "done") {
                if (hasStream) get().finishStreamBucket(raw.stream_id, "done");
                // keep batch
                addEventToBatch(ev);
                return;
              }

              // 5) batch_done → load thread and end
              if (ev.event === "batch_done" && raw.thread_id) {
                set({ lastBatchThreadId: raw.thread_id, isStreaming: false });
                // Refresh thread list & load new one
                // Run loadThread after 2 seconds to ensure all messages are ready
                setTimeout(() => {
                  get().loadThread?.(raw.thread_id);
                  onThreadReady?.(raw.thread_id);
                }, 2000);

                if (batchTimer) {
                  clearTimeout(batchTimer);
                  processBatch();
                }
                controller.abort();
                return;
              }

              // 6) retry / error → keep per-bucket and in batch (shows in UI logs)
              if (ev.event === "retry" || ev.event === "error") {
                if (hasStream) {
                  get().pushStreamEvent(raw.stream_id, ev);
                  if (ev.event === "error")
                    get().finishStreamBucket(raw.stream_id, "error");
                }
                addEventToBatch(ev);
                return;
              }

              // 7) Fallback: if no stream_id, use global list
              addEventToBatch(ev);
            } catch (e) {
              console.error("Error parsing SSE event:", e);
            }
          },

          onerror(err) {
            console.error("SSE Error:", err);
            if (batchTimer) {
              clearTimeout(batchTimer);
              processBatch();
            }
            set({ isStreaming: false });
          },
        });

        // handle to stop streaming
        return {
          stop: () => {
            if (batchTimer) {
              clearTimeout(batchTimer);
              processBatch();
            }
            controller.abort();
            set({ isStreaming: false });
          },
        };
      },

      // ─── Optional helper for the component ───
      startFormTopicStreaming: (topics, authToken, onThreadReady) => {
        get().clearStreams();
        get().SSEMultiConnection({ topics, authToken, onThreadReady });
      },
    };
  })
);

export const useChat = () => {
  const { token } = useAuth();
  const store = useChatStore();

  // Wrap handleSubmit to include auth token
  const handleSubmitWithAuth = async (message: string) => {
    if (!token) {
      console.error("No auth token available");
      return;
    }

    const store = useChatStore.getState();
    return store.handleSubmit(message, token);
  };

  // Wrap createThread to include auth token
  const createThreadWithAuth = async (
    initialMessage: string,
    title?: string,
    description?: string
  ) => {
    if (!token) {
      console.error("No auth token available");
      return;
    }

    const store = useChatStore.getState();
    return store.createThread(initialMessage, title, description, token);
  };
  const startFormTopic = (
    topics: {
      topicId: string;
      allSubtopics?: boolean;
      subTopicsIds?: string[];
    }[],
    onThreadReady?: (id: string) => void
  ) => {
    if (!token) {
      console.error("No auth token available");
      return;
    }
    store.startFormTopicStreaming(topics, token, onThreadReady);
  };
  return {
    ...store,
    handleSubmit: handleSubmitWithAuth,
    currentThreadId: store.currentThread?._id || null,
    createThread: createThreadWithAuth,
    startFormTopicStreaming: startFormTopic,
  };
};
