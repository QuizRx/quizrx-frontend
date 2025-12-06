import Image from "next/image";
import useStreamingAvatarSession from "@/modules/avatars/hooks/use-streaming-avatar-session";
import {
  StreamingAvatarProvider,
  useStreamingAvatarContext,
} from "../../providers/streaming-avatar";
import { StreamingAvatarSessionState } from "../../types/streaming-avatar";
import StreamMenu from "../../components/interact-ui/stream-menu";
import AvatarVideo from "../../components/interact-ui/avatar-video";
import { useUnmount } from "ahooks";
import Loading from "../../components/loading";
import { cn } from "@/core/lib/utils";
import MainMenu from "../../components/interact-ui/main-menu";

function InteractiveLayout() {
  const { sessionState } = useStreamingAvatarContext();
  const { stopSession } = useStreamingAvatarSession();

  useUnmount(() => {
    stopSession();
  });

  return (
    <div className="w-full h-full rounded-lg mt-8 max-w-6xl mx-auto">
      <div className="relative w-full">
        <div className="h-[30rem] md:h-[44rem] relative w-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarVideo />
          ) : (
            <Image
              src={"/modules/avatar/alessandra.webp"}
              alt={"Interactive Layout"}
              fill
              className={cn(
                "object-cover rounded-2xl",
                sessionState === StreamingAvatarSessionState.CONNECTING &&
                  "blur-xs",
              )}
            />
          )}
        </div>
        <div className="md:absolute md:bottom-10 md:left-1/2 md:transform md:-translate-x-1/2 w-full px-4 md:px-10 mt-4 md:mt-0">
          {sessionState === StreamingAvatarSessionState.INACTIVE && (
            <MainMenu />
            
          )}
          {sessionState === StreamingAvatarSessionState.CONNECTING && (
            <Loading className="size-12" />
          )}
          {sessionState === StreamingAvatarSessionState.CONNECTED && (
            <StreamMenu />
          )}
        </div>
      </div>
    </div>
  );
}

export default function InteractiveLayoutWrapper() {
  return (
    <StreamingAvatarProvider>
      <InteractiveLayout />
    </StreamingAvatarProvider>
  );
}
