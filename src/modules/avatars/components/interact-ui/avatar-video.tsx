import { useEffect, useRef } from "react";
import { useStreamingAvatarContext } from "../../providers/streaming-avatar";

export default function AvatarVideo() {
  const { stream } = useStreamingAvatarContext();
  const mediaStream = useRef<HTMLVideoElement>(null);
  
  // Check browser compatibility
  useEffect(() => {
    console.log("🌐 Browser compatibility check:");
    console.log("- getUserMedia support:", !!navigator.mediaDevices?.getUserMedia);
    console.log("- WebRTC support:", !!window.RTCPeerConnection);
    console.log("- Video autoplay policy:", document.createElement('video').autoplay);
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      console.log("🎥 Setting video stream:", stream);
      console.log("🎥 Stream active:", stream.active);
      console.log("🎥 Stream ID:", stream.id);
      console.log("🎥 Stream tracks:", stream.getTracks());
      
      // Clear any existing stream first
      mediaStream.current.srcObject = null;
      
      // Set the new stream
      mediaStream.current.srcObject = stream;
      
      mediaStream.current.onloadedmetadata = () => {
        console.log("📹 Video metadata loaded, attempting to play");
        console.log("📹 Video dimensions:", mediaStream.current?.videoWidth, "x", mediaStream.current?.videoHeight);
        
        mediaStream.current!.play().then(() => {
          console.log("✅ Video started playing successfully");
          console.log("📹 Video current time:", mediaStream.current?.currentTime);
          console.log("📹 Video duration:", mediaStream.current?.duration);
        }).catch((error) => {
          console.error("❌ Video play failed:", error);
          
          // Try alternative play method
          setTimeout(() => {
            console.log("🔄 Retrying video play...");
            mediaStream.current?.play().catch(retryError => {
              console.error("❌ Retry play also failed:", retryError);
            });
          }, 1000);
        });
      };
      
      mediaStream.current.onerror = (error) => {
        console.error("❌ Video error:", error);
      };
      
      mediaStream.current.oncanplay = () => {
        console.log("📹 Video can start playing");
      };
      
      mediaStream.current.onprogress = () => {
        console.log("📹 Video loading progress");
      };
      
      // Force play attempt after setting srcObject
      setTimeout(() => {
        if (mediaStream.current) {
          console.log("🔄 Force play attempt...");
          mediaStream.current.play().catch(error => {
            console.log("⚠️ Force play failed (this is normal if not ready):", error.message);
          });
        }
      }, 500);
      
    } else {
      console.log("⚠️ No stream or video element:", { 
        stream: !!stream, 
        videoElement: !!mediaStream.current,
        streamType: stream?.constructor?.name,
        streamActive: stream?.active
      });
    }
  }, [stream, mediaStream]);

  return (
    <video
      className="flex h-full object-cover rounded-2xl w-full"
      ref={mediaStream}
      autoPlay
      playsInline
      muted={false}
    >
      <track kind="captions" />
    </video>
  );
}
