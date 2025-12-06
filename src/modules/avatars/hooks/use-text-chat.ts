import { useCallback } from "react";
import { useStreamingAvatarContext } from "../providers/streaming-avatar";
import { TaskMode, TaskType } from "@heygen/streaming-avatar";

export default function useTextChat() {
  const { avatarRef } = useStreamingAvatarContext();

  const sendMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;
      avatarRef.current.speak({
        text: message,
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef],
  );

  return {
    sendMessage,
  };
}
