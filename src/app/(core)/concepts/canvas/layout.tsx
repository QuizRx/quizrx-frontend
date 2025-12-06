"use client";

import React from "react";
import { Background } from "@/core/components/ui/background";
import { CanvasAppSidebar } from "@/modules/concepts/layouts/sidebar/canvas/app-sidebar";
import CanvasTopBar from "@/modules/concepts/layouts/sidebar/canvas/top-bar";
import { Button } from "@/core/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCanvasChat } from "@/modules/concepts/store/react-flow-store";
import { useSavePipelineFlow } from "@/modules/concepts/hooks/use-save-pipeline-flow";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isChatOpen, openChat, closeChat } = useCanvasChat();
  const { saveReactFlow, isSaving } = useSavePipelineFlow();

  return (
    <div className="flex flex-col h-full">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={saveReactFlow}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={isChatOpen ? closeChat : openChat}
            className="flex items-center gap-2 bg-green-700"
          >
            {isChatOpen ? "Close Chat" : "Open Chat"}       
          </Button>
        </div>
        
      </div>

      {/* <CanvasTopBar /> */}
      <div className="flex flex-row w-full h-full relative">
        <CanvasAppSidebar />
        <Background
          className="absolute inset-0 z-0 bg-no-repeat  bg-center pointer-events-none"
          image=""        />        <div className="h-full w-full bg-white/60">{children}</div>
      </div>
    </div>
  );
}