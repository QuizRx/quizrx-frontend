// import { MovingBorders } from "@/core/components/ui/moving-borders";
import { useStreamingAvatarContext } from "@/modules/avatars/providers/streaming-avatar";
import { AudioLinesIcon, History, MessageCircleMoreIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Chat from "./chat";
import { Button } from "@/core/components/ui/button";
import AudioInput from "./audio-input";
import useStreamingAvatarSession from "../../hooks/use-streaming-avatar-session";
import { cn } from "@/core/lib/utils";
import Loading from "../loading";
import TextInput from "./text-input";
import useVoiceChat from "../../hooks/use-voice-chat";

export default function StreamMenu() {
  const {
    isUserTalking,
    isAvatarTalking,
    messages,
    setIsChatHistoryOpen,
    isChatHistoryOpen,
    isVoiceChatActive,
    isVoiceChatLoading,
  } = useStreamingAvatarContext();
  const { stopSession } = useStreamingAvatarSession();
  const { startVoiceChat, stopVoiceChat } = useVoiceChat();

  const handleChatHistoryClick = () => {
    setIsChatHistoryOpen((prev) => !prev);
  };

  const toggleChatInputMode = async () => {
    if (isVoiceChatLoading) return;

    if (isVoiceChatActive) {
      await stopVoiceChat();
    } else {
      await startVoiceChat();
    }
  };

  const handleEndChat = async () => {
    await stopSession();
  };

  return (
    <>
      {/* Chat history - only show when explicitly toggled */}
      {isChatHistoryOpen && (
        <div className="mb-4">
          <Chat />
        </div>
      )}
      <div className="grid lg:grid-cols-[100px_1fr_100px] items-center gap-4">
        <AudioInput />

        {/* Chat/history in the center */}
        <div className="flex items-center justify-center gap-4">
          <div onClick={toggleChatInputMode} className="p-4 border border-primary rounded-md bg-[#181731] cursor-pointer">
            {!isVoiceChatLoading ? (
              isVoiceChatActive ? (
                <MessageCircleMoreIcon className="size-5 text-primary" />
              ) : (
                <AudioLinesIcon className="size-5 text-primary" />
              )
            ) : (
              <Loading />
            )}
          </div>

          {isVoiceChatLoading ? (
            <div className="bg-[#181731] border border-primary rounded-lg w-80 h-14 relative overflow-hidden flex items-center justify-center">
              <Loading />
            </div>
          ) : isVoiceChatActive ? (
            <motion.div
              className="bg-[#181731] border border-primary rounded-lg w-80 h-14 relative overflow-hidden flex items-center justify-center"
              animate={{
                backgroundColor:
                  !isAvatarTalking && !isUserTalking ? "#181731" : "#1e1d3d",
              }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {isUserTalking && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Multiple wave lines for broader effect */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* First wave */}
                      <svg
                        width="70%"
                        height="40"
                        viewBox="0 0 200 40"
                        className="text-primary absolute"
                      >
                        <motion.path
                          d="M0,20 C10,10 15,30 20,20 C25,10 30,25 35,20 C40,15 45,25 50,20 C55,15 60,25 65,20 C70,15 75,25 80,20 C85,15 90,25 95,20 C100,15 105,25 110,20 C115,15 120,25 125,20 C130,15 135,25 140,20 C145,15 150,25 155,20 C160,15 165,25 170,20 C175,15 180,25 185,20 C190,15 195,30 200,20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          initial={{ pathLength: 0, opacity: 0.3 }}
                          animate={{
                            pathLength: [0, 1, 0],
                            opacity: [0.1, 0.8, 0.1],
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.1,
                          }}
                        />
                      </svg>

                      {/* Second wave */}
                      <svg
                        width="70%"
                        height="40"
                        viewBox="0 0 200 40"
                        className="text-primary/70 absolute"
                      >
                        <motion.path
                          d="M0,20 C12,5 18,35 25,20 C32,5 38,30 42,20 C48,10 52,30 58,20 C64,10 68,30 75,20 C82,10 88,30 92,20 C98,10 105,30 110,20 C115,10 122,30 128,20 C135,10 140,30 148,20 C154,10 160,30 168,20 C175,10 182,30 188,20 C194,10 198,35 200,20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          initial={{ pathLength: 0, opacity: 0.3 }}
                          animate={{
                            pathLength: [0, 1, 0],
                            opacity: [0.1, 0.6, 0.1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </svg>

                      {/* Third wave */}
                      <svg
                        width="70%"
                        height="40"
                        viewBox="0 0 200 40"
                        className="text-primary/50 absolute"
                      >
                        <motion.path
                          d="M0,20 C8,30 15,10 22,20 C29,30 35,10 42,20 C49,30 55,10 62,20 C69,30 75,10 82,20 C89,30 95,10 102,20 C109,30 115,10 122,20 C129,30 135,10 142,20 C149,30 155,10 162,20 C169,30 175,10 182,20 C189,30 195,10 200,20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          initial={{ pathLength: 0, opacity: 0.3 }}
                          animate={{
                            pathLength: [0, 1, 0],
                            opacity: [0.1, 0.5, 0.1],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2,
                          }}
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <TextInput />
          )}

          <div  onClick={handleChatHistoryClick} className="p-4 border border-primary rounded-md bg-[#181731] cursor-pointer">
            <History
              className={cn(
                "size-5 transition-colors",
                isChatHistoryOpen ? "text-primary" : "text-white"
              )}
            />
          </div>
        </div>

        <Button
          size={"lg"}
          className={"hidden md:block"}
          onClick={handleEndChat}
        >
          End Chat
        </Button>
      </div>
    </>
  );
}
