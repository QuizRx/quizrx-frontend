import { Button } from "@/core/components/ui/button";
// import { MovingBorders } from "@/core/components/ui/moving-borders";
import { Mic, MicOff } from "lucide-react";
import { useStreamingAvatarContext } from "../../providers/streaming-avatar";
import useStreamingAvatarSession from "../../hooks/use-streaming-avatar-session";
import useVoiceChat from "../../hooks/use-voice-chat";
import Loading from "../loading";

export default function AudioInput() {
  const { isUserTalking } = useStreamingAvatarContext();
  const { stopSession } = useStreamingAvatarSession();
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    isMuted,
    unmuteVoiceChat,
    muteVoiceChat,
    startVoiceChat,
  } = useVoiceChat();

  const handleMicClick = async () => {
    if (isMuted) {
      if (!isVoiceChatActive) {
        await startVoiceChat();
      }

      if (isVoiceChatActive) {
        unmuteVoiceChat();
      }
    } else {
      muteVoiceChat();
    }
  };

  const handleEndChat = async () => {
    await stopSession();
  };

  return (
    <div className="flex gap-2 justify-start items-center">
      <div onClick={handleMicClick} className="p-4 border border-primary rounded-md bg-[#181731] cursor-pointer">
        {!isVoiceChatLoading ? (
          isMuted ? (
            <MicOff className={`size-5 text-primary`} />
          ) : (
            <Mic className={`size-5 text-primary`} />
          )
        ) : null}
        {isVoiceChatLoading && <Loading className="animate-spin" />}
      </div>
      <Button className="md:hidden" onClick={handleEndChat}>
        End Chat
      </Button>
    </div>
  );
}
