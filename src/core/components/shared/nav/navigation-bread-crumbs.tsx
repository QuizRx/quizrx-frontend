"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/core/components/ui/breadcrumb";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useChatStore } from "@/modules/chat/store/chat-store";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const NavBreadCrumbs = () => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [segments, setSegments] = useState<string[]>([]);
  const availableThreads = useChatStore((s) => s.availableThreads);
  const currentThread = useChatStore((s) => s.currentThread);

  useEffect(() => {
    // Only run on the client side
    setIsClient(true);
    if (pathname) {
      setSegments(pathname.split("/").filter(Boolean));
    }
  }, [pathname]);

  const capitalizeWordsAndRemoveSlashes = (str: string) => {
    return str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Detect the /dashboard/chat/[id] route shape so we can render the chat
  // title instead of the raw thread id (ChatGPT-style breadcrumb).
  const threadIdSegmentIndex = useMemo(() => {
    if (segments[0] === "dashboard" && segments[1] === "chat" && segments[2]) {
      return 2;
    }
    return -1;
  }, [segments]);

  const resolveThreadTitle = (threadId: string): string | null => {
    const fromList = availableThreads.find((t) => t._id === threadId);
    if (fromList?.title) return fromList.title;
    if (currentThread?._id === threadId && currentThread.title) {
      return currentThread.title;
    }
    return null;
  };

  // Show shadcn skeleton components until client-side rendering takes place
  if (!isClient) {
    return (
      <div className="hidden md:flex items-center space-x-2 h-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const isThreadIdSegment = index === threadIdSegmentIndex;
          const threadTitle = isThreadIdSegment
            ? resolveThreadTitle(segment)
            : null;

          // While the thread title is still loading (e.g. just after a hard
          // refresh on /dashboard/chat/[id]), show a small skeleton so we
          // never flash the raw id.
          const label = isThreadIdSegment ? (
            threadTitle ? (
              <span className="line-clamp-1 max-w-[180px] sm:max-w-[260px] md:max-w-[360px]">
                {threadTitle}
              </span>
            ) : (
              <Skeleton className="h-3 w-24" />
            )
          ) : (
            capitalizeWordsAndRemoveSlashes(segment)
          );

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem className="hidden md:block">
                {isLast ? (
                  <BreadcrumbPage className="text-primary text-sm max-lg:text-xs">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={href}
                    className="text-gray-600 text-md max-lg:text-xs hover:text-primary"
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default NavBreadCrumbs;
