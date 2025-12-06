"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Separator } from "@/core/components/ui/separator";
import { type ClassValue, clsx } from "clsx";
import { Clock } from "lucide-react";
import { useNotificationSidebar } from "@/core/providers/notification-sidebar-provider";
import { useQuery, gql, useMutation } from "@apollo/client";
import { useAuth } from "@/core/providers/auth";
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";

// Utility function to format date as relative time
const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      title
      description
      type
      createdAt
      isRead
    }
  }
`;

const MARK_ALL_AS_READ = gql`
  mutation MarkAllAsRead {
    markAllNotificationsAsRead {
      success
    }
  }
`;

export function NotificationSideDrawer() {
  const { isOpen, closeSidebar } = useNotificationSidebar();
  const [activeTab, setActiveTab] = useState("unread");
  const [visibleCount, setVisibleCount] = useState(10);

  const { user } = useAuth();

  const {
    data: notifications,
    loading,
    error,
    refetch,
  } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: "network-only",
  });

  const [markAllAsRead, { loading: markAllLoading }] = useMutation(
    MARK_ALL_AS_READ,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  const userNotification = notifications?.notifications || [];

  const unreadNotifications = userNotification.filter(
    (notif: any) => !notif.isRead
  );
  const allNotifications = userNotification;

  // Get the current filtered notifications based on active tab
  const currentNotifications =
    activeTab === "unread" ? unreadNotifications : allNotifications;

  // Get the visible notifications for lazy loading
  const visibleNotifications = currentNotifications.slice(0, visibleCount);
  const hasMoreNotifications = currentNotifications.length > visibleCount;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setVisibleCount(10); // Reset to 10 when switching tabs
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeSidebar}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10 z-40" />

        <Dialog.Content
          className="
            fixed top-0 right-0 h-full w-100 bg-white z-50 py-6 shadow-lg
            transition-transform duration-300 ease-out overflow-y-scroll
            data-[state=open]:translate-x-0
            data-[state=closed]:translate-x-full
          "
        >
          <div className="flex justify-between items-center mb-4 px-6">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-lg font-bold">
                Notification
              </Dialog.Title>
              {unreadNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllLoading}
                  className="text-xs"
                >
                  {markAllLoading ? "Marking..." : "Mark all as read"}
                </Button>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="text-gray-500 hover:text-gray-800"
              >
                <Cross1Icon />
              </button>
            </Dialog.Close>
          </div>

          <div className="w-full rounded-lg bg-white space-y-4 px-6">
            <Separator />

            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    All
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                      {allNotifications.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="flex items-center gap-2"
                  >
                    Unread
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {unreadNotifications.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                {allNotifications.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {visibleNotifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        className={`border rounded-lg p-4 shadow-sm ${
                          notif.isRead
                            ? "bg-gray-50"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          {notif.title}
                        </h3>
                        <p className="text-gray-700 text-sm mt-1">
                          {notif.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(notif.createdAt)}
                          </div>
                          {!notif.isRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {hasMoreNotifications && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          className="text-sm"
                        >
                          Load More (
                          {currentNotifications.length - visibleCount}{" "}
                          remaining)
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No notifications found.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="mt-0">
                {unreadNotifications.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {visibleNotifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        className="border rounded-lg p-4 shadow-sm bg-blue-50 border-blue-200"
                      >
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          {notif.title}
                        </h3>
                        <p className="text-gray-700 text-sm mt-1">
                          {notif.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(notif.createdAt)}
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            Unread
                          </span>
                        </div>
                      </div>
                    ))}
                    {hasMoreNotifications && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          className="text-sm"
                        >
                          Load More (
                          {currentNotifications.length - visibleCount}{" "}
                          remaining)
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No unread notifications.
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Separator />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
