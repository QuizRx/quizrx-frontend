"use client";

import InteractiveLayoutWrapper from "@/modules/avatars/layouts/interact/interact";
import { isAvatarEnabled } from "@/core/utils/feature-flags";

export default function ChatPage() {
  if (!isAvatarEnabled()) {
    return (
      <div className="flex flex-col w-full px-6 md:px-10">
        <p className="text-zinc-400">
          Avatar sessions are currently disabled for closed beta.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-6 md:px-10">
      <InteractiveLayoutWrapper />
    </div>
  );
}
