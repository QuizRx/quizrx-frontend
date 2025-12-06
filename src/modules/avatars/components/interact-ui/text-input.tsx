import { useState } from "react";
import useTextChat from "../../hooks/use-text-chat";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { ArrowUpIcon } from "lucide-react";

export default function TextInput() {
  const { sendMessage } = useTextChat();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Message:", message);

    if (message) {
      sendMessage(message);
      setMessage("");
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#181731] border border-primary rounded-lg w-80 h-14 relative overflow-hidden flex items-center justify-center"
    >
      <Input
        type="text"
        className="bg-[#181731] border border-primary rounded-lg w-80 h-14 relative overflow-hidden flex items-center justify-center px-4 text-white"
        placeholder="Ask anything"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="absolute right-4">
        <Button
          size={"sm"}
          type="submit"
          className="cursor-pointer z-20 pointer-events-auto active:scale-95"
        >
          <ArrowUpIcon className="size-5" />
        </Button>
      </div>
    </form>
  );
}
