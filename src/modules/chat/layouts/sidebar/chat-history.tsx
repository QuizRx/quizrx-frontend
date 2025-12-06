"use client";

import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Input } from "@/core/components/ui/input";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import { useMutation } from "@apollo/client";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DELETE_THREAD_MUTATION } from "../../apollo/mutation/thread";
import { useChat } from "../../store/chat-store";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/core/providers/auth";
import { useIsMobile } from "@/core/hooks/use-mobile";

export function ChatHistorySidebar() {
  const { isChatSidebarOpen, closeChatSidebar } = useChatSidebar();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuth();

  const {
    availableThreads,
    isLoadingThreadList,
    fetchAvailableThreads,
    loadThread,
    currentThreadId,
    resetChat,
  } = useChat();

  const [deleteThread, { loading: isDeleting }] = useMutation(
    DELETE_THREAD_MUTATION,
    {
      onCompleted: () => {
        fetchAvailableThreads();
        setIsDeleteDialogOpen(false);
        setThreadToDelete(null);
      },
    }
  );

  useEffect(() => {
    if (token) {
      fetchAvailableThreads();
    }
  }, [token, fetchAvailableThreads]);

  const filteredThreads = availableThreads
    .filter(
      (thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (thread.description &&
          thread.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleThreadSelect = (threadId: string) => {
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
    loadThread(threadId);

    // Close sidebar on mobile after selecting a thread
    if (isMobile) {
      closeChatSidebar();
    }
  };

  const handleNewChat = () => {
    resetChat();
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }

    // Close sidebar on mobile after creating new chat
    if (isMobile) {
      closeChatSidebar();
    }
  };

  const openDeleteDialog = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    setThreadToDelete(threadId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteThread = async () => {
    if (!threadToDelete) return;

    try {
      await deleteThread({
        variables: { threadId: threadToDelete },
      });

      if (threadToDelete === currentThreadId) {
        resetChat();
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      setIsDeleteDialogOpen(false);
    }
  };

  const getThreadTitle = () => {
    if (!threadToDelete) return "";
    const thread = availableThreads.find((t) => t._id === threadToDelete);
    return thread?.title || "this chat";
  };

  return (
    <>
      <AnimatePresence>
        {isChatSidebarOpen && (
          <>
            {/* Overlay/Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={closeChatSidebar}
              />
            )}

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed right-0 border-l overflow-hidden border border-zinc-200 ${
                isMobile
                  ? "inset-y-0 z-50 w-[85vw] max-w-[350px] bg-white shadow-xl"
                  : "top-[50px] bottom-0 h-[calc(100%-60px)] z-40 w-[290px] bg-white/50 backdrop-blur-sm"
              }`}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-auto flex flex-col"
              >
                <div className="flex flex-col gap-2 p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-full p-2 bg-background rounded-lg border">
                      <div className="flex items-center gap-2">
                        <ChatBubbleIcon className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-semibold">Chat History</h2>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={"outline"}
                    className="border-dashed border-primary hover:bg-primary/10 transition-colors w-full gap-2"
                    onClick={handleNewChat}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>New Chat</span>
                  </Button>
                  <Input
                    placeholder="Search chats..."
                    className="w-full mt-2"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {isLoadingThreadList ? (
                    Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={`skeleton-${index}`}
                          className="w-full border rounded-lg overflow-hidden  shadow-xl shadow-zinc-200"
                        >
                          <div className="p-3">
                            <div className="flex items-center justify-between w-full mb-2">
                              <Skeleton className="h-3 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-3/4 mb-2 rounded" />
                            <Skeleton className="h-3 w-full rounded" />
                          </div>
                        </div>
                      ))
                  ) : filteredThreads.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full flex flex-col items-center justify-center py-8"
                    >
                      <div className="p-3 text-center">
                        <p className="text-sm text-muted-foreground">
                          {availableThreads.length > 0
                            ? "No matching chats found"
                            : "No chats yet"}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {filteredThreads.map((thread) => (
                        <motion.div
                          key={thread._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.2 }}
                          layout
                        >
                          <div
                            className={`w-full cursor-pointer shadow-xl shadow-zinc-200  transition-colors rounded-md overflow-hidden ${
                              currentThreadId === thread._id
                                ? "bg-white border-primary/30"
                                : "border-border"
                            }`}
                            onClick={() => handleThreadSelect(thread._id)}
                            onMouseEnter={() => setHoveredThreadId(thread._id)}
                            onMouseLeave={() => setHoveredThreadId(null)}
                          >
                            <div className="p-3 relative">
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(thread.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>

                                <AnimatePresence>
                                  {hoveredThreadId === thread._id && (
                                    <motion.button
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      onClick={(e) =>
                                        openDeleteDialog(e, thread._id)
                                      }
                                      className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors"
                                      disabled={
                                        isDeleting ||
                                        threadToDelete === thread._id
                                      }
                                      aria-label="Delete thread"
                                    >
                                      {threadToDelete === thread._id &&
                                      isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2
                                          className="h-4 w-4"
                                          color="red"
                                        />
                                      )}
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="font-medium text-sm line-clamp-1">
                                {thread.title}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {thread.description || "Endocrinology"}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Delete Chat
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{getThreadTitle()}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteThread}
              disabled={isDeleting}
              className="rounded-lg gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
