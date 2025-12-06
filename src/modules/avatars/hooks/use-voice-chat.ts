import { useCallback, useEffect, useState, useRef } from "react";
import { useStreamingAvatarContext } from "../providers/streaming-avatar";
import { useToast } from "@/core/hooks/use-toast";

export default function useVoiceChat() {
  const {
    avatarRef,
    isMuted,
    setIsMuted,
    isVoiceChatActive,
    setIsVoiceChatActive,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
  } = useStreamingAvatarContext();
  const { toast } = useToast();
  
  // Voice activity detection state
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
    // Voice activity detection function
  const startVoiceActivityDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        // Threshold for voice activity (adjust as needed)
        const threshold = 20;
        setIsReceivingAudio(average > threshold);
        
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
    } catch (error) {
      console.error("Voice activity detection failed:", error);
    }
  }, []);

  const stopVoiceActivityDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsReceivingAudio(false);
  }, []);

  const startVoiceChat = useCallback(async () => {
    try {
      console.log("Starting voice chat...", avatarRef.current);
      if (!avatarRef.current) return;
      setIsVoiceChatLoading(true);
      await avatarRef.current.startVoiceChat({ isInputAudioMuted: false });
      setIsVoiceChatLoading(false);
      setIsVoiceChatActive(true);
      setIsMuted(false); // Start unmuted for immediate use
      
      // Start voice activity detection
      await startVoiceActivityDetection();
      
      console.log("Voice chat started (unmuted and ready).");
    } catch (error: any) {
      console.error("Error starting voice chat:", error);
      setIsVoiceChatLoading(false);
      setIsVoiceChatActive(false);
      setIsMuted(true);
      toast({
        title: "Error starting voice chat",
        description: error?.message,
      });
    }
  }, [avatarRef, setIsMuted, setIsVoiceChatActive, setIsVoiceChatLoading, startVoiceActivityDetection]);

  const stopVoiceChat = useCallback(async () => {
    console.log("Stopping voice chat...");
    if (!avatarRef.current) return;
    await avatarRef.current.closeVoiceChat();
    stopVoiceActivityDetection();
    setIsMuted(true);
    setIsVoiceChatActive(false)
    console.log("Voice chat stopped.");
  }, [avatarRef, setIsMuted, setIsVoiceChatActive, stopVoiceActivityDetection]);

  const muteVoiceChat = useCallback(() => {
    console.log("Muting voice chat...");
    if (!avatarRef.current) return;
    avatarRef.current.muteInputAudio();
    setIsMuted(true);
    console.log("Voice chat muted.");
  }, [avatarRef, setIsMuted]);

  const unmuteVoiceChat = useCallback(() => {
    console.log("Unmuting voice chat...");
    if (!avatarRef.current) return;
    avatarRef.current.unmuteInputAudio();
    setIsMuted(false);
    console.log("Voice chat unmuted.");
  }, [avatarRef, setIsMuted]);

  return {
    startVoiceChat,
    stopVoiceChat,
    muteVoiceChat,
    unmuteVoiceChat,
    isMuted,
    isVoiceChatActive,
    isVoiceChatLoading,
    isReceivingAudio,
  };
}
