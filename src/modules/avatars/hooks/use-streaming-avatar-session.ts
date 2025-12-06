import StreamingAvatar from "@heygen/streaming-avatar";
import {
  StreamingEvents,
  AvatarQuality,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  TaskType
} from "@heygen/streaming-avatar";
import { useCallback, useState, useRef } from "react";
import { useStreamingAvatarContext } from "../providers/streaming-avatar";
import useVoiceChat from "./use-voice-chat";
import { StreamingAvatarSessionState } from "../types/streaming-avatar";
import { useMemoizedFn } from "ahooks";
import { useToast } from "@/core/hooks/use-toast";

const DEFAULT_CHAPTER_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "Alessandra_Chair_Sitting_public",
  // knowledgeId removed - will be provided per session if needed
  voice: {
    rate: 1,
    emotion: VoiceEmotion.FRIENDLY,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  disableIdleTimeout: false,
  voiceChatTransport: VoiceChatTransport.LIVEKIT,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

const DEFAULT_EXPLANATION_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: "Alessandra_Chair_Sitting_public",
  knowledgeBase: "you will act like a teacher and explain the question to the user",
  voice: {
    rate: 1,
    emotion: VoiceEmotion.FRIENDLY,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  disableIdleTimeout: false,
  voiceChatTransport: VoiceChatTransport.LIVEKIT,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

export interface SessionConfig {
  mode: 'chapter' | 'explanation';
  chapterKnowledgeId?: string;
  explanationText?: string;
}

export default function useStreamingAvatarSession() {
  const {
    avatarRef,
    setIsUserTalking,
    setIsListening,
    setStream,
    setIsAvatarTalking,
    setSessionState,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    setIsVoiceChatLoading,
    setIsVoiceChatActive,
    clearMessages,
  } = useStreamingAvatarContext();
  const { startVoiceChat, stopVoiceChat } = useVoiceChat();
  const { toast } = useToast();

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/heygen-get-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token);

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const init = useCallback(
    (token: string) => {
      console.log("Initializing avatar...");
      avatarRef.current = new StreamingAvatar({
        token,
        basePath: "https://api.heygen.com",
      });
      return avatarRef.current;
    },
    [avatarRef],
  );

  const handleStream = useCallback(
    async (e: any) => {
      console.log("🎬 Stream ready event:", e);
      console.log("🎬 Stream detail:", e.detail);
      console.log("🎬 Stream type:", typeof e.detail);
      console.log("🎬 Stream tracks:", e.detail?.getTracks?.());
      
      if (e.detail) {
        setStream(e.detail);
        console.log("✅ Stream set in context");
      } else {
        console.error("❌ No stream detail in event");
      }
      
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    },
    [setStream, setSessionState],
  );

  const stopSession = useCallback(async () => {
    console.log("Stopping session...");
    setIsVoiceChatLoading(true);
    avatarRef.current?.off(StreamingEvents.STREAM_READY, handleStream);
    avatarRef.current?.off(StreamingEvents.STREAM_DISCONNECTED, stopSession);
    setIsListening(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);
    setStream(null);
    await stopVoiceChat();
    await avatarRef.current?.stopAvatar();
    setSessionState(StreamingAvatarSessionState.INACTIVE);
    setIsVoiceChatLoading(false);
    setIsVoiceChatActive(false);
    clearMessages();
  }, [
    avatarRef,
    stopVoiceChat,
    setIsListening,
    setIsUserTalking,
    setIsAvatarTalking,
    setStream,
    setSessionState,
    setIsVoiceChatActive,
    setIsVoiceChatLoading,
    clearMessages,
    handleStream,
  ]);

  const createAvatarConfig = useCallback((config: SessionConfig): StartAvatarRequest => {
        if (config.mode === 'chapter') {
      // Simple chapter mode - always use custom knowledge base for voice input
      const avatarConfig = {
        ...DEFAULT_CHAPTER_CONFIG,
        knowledgeBase: config.explanationText || "You are an endocrinology expert.",
      };
      
      console.log("🔧 Chapter Avatar Config:");
      console.log("- knowledgeBase length:", avatarConfig.knowledgeBase?.length || 0);
      console.log("- knowledgeBase preview:", avatarConfig.knowledgeBase?.substring(0, 200) + "...");
      console.log("- Has explanationText:", !!config.explanationText);
      console.log("- Full config keys:", Object.keys(avatarConfig));
      
      return avatarConfig;
    } else {
      return {
        ...DEFAULT_EXPLANATION_CONFIG,
        knowledgeBase: config.explanationText || DEFAULT_EXPLANATION_CONFIG.knowledgeBase,
      };
    }
  }, []);

  const startAvatar = useCallback(
    async (token: string, avatarConfig: StartAvatarRequest) => {
      try {
        console.log("Starting avatar...");
        console.log("Avatar config being used:", avatarConfig);
        
        if (!avatarRef.current) {
          init(token);
        }

        if (!avatarRef.current) {
          throw new Error("Avatar is not initialized");
        }

        avatarRef.current.on(StreamingEvents.STREAM_READY, handleStream);
        avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, stopSession);
        avatarRef.current.on(StreamingEvents.USER_START, () => {
          setIsUserTalking(true);
        });
        avatarRef.current.on(StreamingEvents.USER_STOP, () => {
          setIsUserTalking(false);
        });
        avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
          setIsAvatarTalking(true);
        });
        avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
          setIsAvatarTalking(false);
        });
        avatarRef.current.on(
          StreamingEvents.USER_TALKING_MESSAGE,
          handleUserTalkingMessage,
        );
        avatarRef.current.on(
          StreamingEvents.AVATAR_TALKING_MESSAGE,
          handleStreamingTalkingMessage,
        );
        avatarRef.current.on(
          StreamingEvents.USER_END_MESSAGE,
          handleEndMessage,
        );
        avatarRef.current.on(
          StreamingEvents.AVATAR_END_MESSAGE,
          handleEndMessage,
        );

        console.log("Creating avatar with config:", avatarConfig);
        
        // Add debugging to track the avatar creation process
        console.log("🎭 About to call createStartAvatar...");
        const result = await avatarRef.current.createStartAvatar(avatarConfig);
        console.log("🎭 createStartAvatar completed:", result);
        
        // Double-check that events are registered
        console.log("🎭 Avatar instance:", avatarRef.current);
        console.log("🎭 Available methods:", Object.getOwnPropertyNames(avatarRef.current));
        
        return avatarRef.current;
      } catch (error) {
        console.error("Error starting avatar:", error);
        throw error;
      }
    },
    [
      avatarRef,
      init,
      setIsUserTalking,
      setIsAvatarTalking,
      handleStream,
      stopSession,
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
    ],
  );

  const startSession = useCallback(async (config: SessionConfig, initialPrompt?: string) => {
    try {
      console.log("Starting session...");
      console.log("Session config:", config);
      setSessionState(StreamingAvatarSessionState.CONNECTING);
      
      const avatarConfig = createAvatarConfig(config);
      console.log("Generated avatar config:", avatarConfig);
      
      const token = await fetchAccessToken();
      const avatar = init(token);

      avatar.on(StreamingEvents.STREAM_READY, (e) => {
        console.log("🎬 Stream Ready!", e);
        // Speak immediately when stream is ready if we have a prompt
        if (initialPrompt) {
          console.log("📢 Stream ready - speaking initial prompt:", initialPrompt);
          setTimeout(async () => {
            await speak(initialPrompt, "chat");
          }, 200); // Very short delay just to ensure everything is settled
        }
      });
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () =>
        setIsAvatarTalking(true),
      );
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () =>
        setIsAvatarTalking(false),
      );      console.time("Avatar Initialization");
      await startAvatar(token, avatarConfig);
      console.timeEnd("Avatar Initialization");

      // Start voice chat for both modes now
      console.log(`Starting voice chat for ${config.mode} mode...`);
      startVoiceChat().then(() => {
        console.log("✅ Voice chat ready");
      }).catch(err => {
        console.error("❌ Voice chat failed:", err);
      });
      
      // Speaking is now handled in the STREAM_READY event for better timing
      
    } catch (error: any) {
      console.error("Error starting session:", error);
      setIsVoiceChatLoading(false);
      setIsVoiceChatActive(false);
      setSessionState(StreamingAvatarSessionState.INACTIVE);
      toast({
        title: "Error starting session",
        description: error?.message,
      });
    }
  }, [createAvatarConfig, init, startAvatar, startVoiceChat, setSessionState, setIsAvatarTalking, setIsVoiceChatLoading, setIsVoiceChatActive, toast, avatarRef]);

  const speak = useCallback(
    async (text: string, mode: "repeat" | "chat" = "repeat") => {
      console.log("🎤 Avatar speak called:", text, "Mode:", mode);
      console.log("Avatar reference available:", !!avatarRef.current);
      console.log("Current avatarRef:", avatarRef.current);
      console.log("Current avatarRef:", avatarRef.current);

      let attempts = 0;
      const maxAttempts = 30; // 3 seconds with 100ms intervals

      while (!avatarRef.current && attempts < maxAttempts) {
        console.log(`Waiting for avatar (attempt ${attempts + 1}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!avatarRef.current) {
        console.error("❌ Avatar not ready after waiting 3 seconds");
        return;
      }

      console.log("✅ Avatar ready, speaking now:", text);
      await avatarRef.current.speak({
        text,
        task_type: mode === "chat" ? TaskType.TALK : TaskType.REPEAT,
      });
    },
    [avatarRef],
  );  return {
    startSession,
    stopSession,
    speak,
  };
}