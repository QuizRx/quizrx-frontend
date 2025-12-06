import { useEffect, useRef } from "react";
import { useStreamingAvatarContext } from "../../providers/streaming-avatar";

export default function AvatarVideo({stream}: { stream: MediaStream | null }) {
  const mediaStream = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [stream, mediaStream]);

  return (
    <video
      className="flex h-full object-cover rounded-2xl w-full"
      ref={mediaStream}
    >
      <track kind="captions" />
    </video>
  );
}
