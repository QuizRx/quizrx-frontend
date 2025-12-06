import StreamingAvatar, {
  StreamingTalkingMessageEvent,
  UserTalkingMessageEvent,
} from "@heygen/streaming-avatar";
import { createContext, useContext, useRef, useState } from "react";
import {
  MessageSender,
  Message,
  StreamingAvatarContextProps,
  StreamingAvatarSessionState,
} from "@/modules/avatars/types/streaming-avatar";

const StreamingAvatarContext = createContext<StreamingAvatarContextProps>({
  avatarRef: { current: null },
  isMuted: true,
  setIsMuted: () => {},
  isVoiceChatLoading: false,
  setIsVoiceChatLoading: () => {},
  sessionState: StreamingAvatarSessionState.INACTIVE,
  setSessionState: () => {},
  isVoiceChatActive: false,
  setIsVoiceChatActive: () => {},
  stream: null,
  setStream: () => {},
  messages: [],
  clearMessages: () => {},
  handleUserTalkingMessage: () => {},
  handleStreamingTalkingMessage: () => {},
  handleEndMessage: () => {},
  isListening: false,
  setIsListening: () => {},
  isUserTalking: false,
  setIsUserTalking: () => {},
  isAvatarTalking: false,
  setIsAvatarTalking: () => {},
  isChatHistoryOpen: false,
  setIsChatHistoryOpen: () => {},
  // connectionQuality: ConnectionQuality.UNKNOWN,
  // setConnectionQuality: () => {},
});

const useStreamingAvatarVoiceChatState = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isVoiceChatLoading, setIsVoiceChatLoading] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);

  return {
    isMuted,
    setIsMuted,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
    isVoiceChatActive,
    setIsVoiceChatActive,
  };
};

const useStreamingAvatarSessionState = () => {
  const [sessionState, setSessionState] = useState(
    StreamingAvatarSessionState.INACTIVE,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);

  return {
    sessionState,
    setSessionState,
    stream,
    setStream,
  };
};

const useStreamingAvatarMessageState = () => {
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.CLIENT,
    //   content: "Hello, how are you?",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.AVATAR,
    //   content: "I'm doing great, thanks for asking!",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.CLIENT,
    //   content: "That's great to hear! How about you?",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.AVATAR,
    //   content: "Same here, thanks for asking!",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.CLIENT,
    //   content: "It's great to hear from you too! What brings you here?",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.AVATAR,
    //   content:
    //     "Just exploring the world, and learning about different cultures.",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.CLIENT,
    //   content:
    //     "Wow, that's really interesting! What kind of cultures are you exploring?",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.AVATAR,
    //   content:
    //     "Exploring different cultures, learning about different ways of life, and experiencing new things.",
    // },
    // {
    //   id: Date.now().toString(),
    //   sender: MessageSender.CLIENT,
    //   content:
    //     "That sounds like an amazing journey! What kind of experiences are you looking forward to?",
    // },
  ]);
  const currentSenderRef = useRef<MessageSender | null>(null);

  const handleUserTalkingMessage = ({
    detail,
  }: {
    detail: UserTalkingMessageEvent;
  }) => {
    const formattedMessage = detail.message.replace(/^"|"$/g, ''); // Removes starting and ending quotes
    if (currentSenderRef.current === MessageSender.CLIENT) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          content: [prev[prev.length - 1].content, formattedMessage].join(""),
        },
      ]);
    } else {
      currentSenderRef.current = MessageSender.CLIENT;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: MessageSender.CLIENT,
          content: formattedMessage,
        },
      ]);
    }
  };

  const handleStreamingTalkingMessage = ({
    detail,
  }: {
    detail: StreamingTalkingMessageEvent;
  }) => {
    if (currentSenderRef.current === MessageSender.AVATAR) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          content: [prev[prev.length - 1].content, detail.message].join(""),
        },
      ]);
    } else {
      currentSenderRef.current = MessageSender.AVATAR;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: MessageSender.AVATAR,
          content: detail.message,
        },
      ]);
    }
  };

  const handleEndMessage = () => {
    currentSenderRef.current = null;
  };

  return {
    messages,
    clearMessages: () => {
      setMessages([]);
      currentSenderRef.current = null;
    },
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
  };
};

const useStreamingAvatarListeningState = () => {
  const [isListening, setIsListening] = useState(false);

  return { isListening, setIsListening };
};

const useStreamingAvatarTalkingState = () => {
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);

  return {
    isUserTalking,
    setIsUserTalking,
    isAvatarTalking,
    setIsAvatarTalking,
  };
};

const useStreamingAvatarChatHistoryState = () => {
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  return {
    isChatHistoryOpen,
    setIsChatHistoryOpen,
  };
};

export const StreamingAvatarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const avatarRef = useRef<StreamingAvatar>(null);
  const voiceChatState = useStreamingAvatarVoiceChatState();
  const sessionState = useStreamingAvatarSessionState();
  const messageState = useStreamingAvatarMessageState();
  const listeningState = useStreamingAvatarListeningState();
  const talkingState = useStreamingAvatarTalkingState();
  const chatHistoryState = useStreamingAvatarChatHistoryState();
  // const connectionQualityState = useStreamingAvatarConnectionQualityState();

  return (
    <StreamingAvatarContext.Provider
      value={{
        avatarRef,
        ...voiceChatState,
        ...sessionState,
        ...messageState,
        ...listeningState,
        ...talkingState,
        ...chatHistoryState,
      }}
    >
      {children}
    </StreamingAvatarContext.Provider>
  );
};

export const useStreamingAvatarContext = () => {
  return useContext(StreamingAvatarContext);
};
