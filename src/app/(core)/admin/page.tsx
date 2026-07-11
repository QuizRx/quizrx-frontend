"use client";

import {
  ArrowLeft,
  MessageSquare,
  MessagesSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { AdminChatsTable } from "@/modules/admin/components/admin-chats-table";
import { AdminFeedbackTable } from "@/modules/admin/components/admin-feedback-table";
import { AdminUsersTable } from "@/modules/admin/components/admin-users-table";

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to chat
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            Admin panel
          </h1>
          <p className="text-sm text-zinc-500">
            Manage users, browse chats, and review feedback.
          </p>
        </div>
      </header>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="chats" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chats
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessagesSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminUsersTable />
        </TabsContent>
        <TabsContent value="chats">
          <AdminChatsTable />
        </TabsContent>
        <TabsContent value="feedback">
          <AdminFeedbackTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
