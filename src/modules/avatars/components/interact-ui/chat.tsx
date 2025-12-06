import { useStreamingAvatarContext } from "@/modules/avatars/providers/streaming-avatar";
import { MessageSender } from "@/modules/avatars/types/streaming-avatar";

export default function Chat() {
  const { messages, isChatHistoryOpen } = useStreamingAvatarContext();

  const chatBubble = {
    [MessageSender.CLIENT]: (message: string) => (
      <div className="flex ml-auto justify-end max-w-3/4">
        <div className="relative max-w-md p-4 bg-black/50 backdrop-blur text-white rounded-2xl shadow-md">
          <p className="text-xs">{message}</p>
        </div>
      </div>
    ),
    [MessageSender.AVATAR]: (message: string) => (
      <div className="flex items-start max-w-3/4">
        <div className="relative max-w-md p-4 bg-black/10 backdrop-blur text-white rounded-2xl shadow-md">
          <p className="text-xs">{message}</p>
        </div>
      </div>
    ),
  };

  return (
    <div className={["max-w-lg w-full space-y-6 p-4 mx-auto rounded-lg", isChatHistoryOpen ? "overflow-y-auto bg-gray-900/90 h-[25vh]" : ""].join(" ")} >
      {messages.slice(isChatHistoryOpen ? 0 : Math.max(messages.length - 4, 0), messages.length).map((msg, index) => (
        <div key={msg.id} className={ [!isChatHistoryOpen && index === 0 && messages.length > 3 ? 'opacity-50' : ''].join(' ') }>{chatBubble[msg.sender](msg.content)}</div>
      ))}
    </div>
  );
}
