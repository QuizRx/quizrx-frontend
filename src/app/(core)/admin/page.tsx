"use client";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  MessageSquare,
  MessagesSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { AdminActivityLog } from "@/modules/admin/components/admin-activity-log";
import { AdminChatsTable } from "@/modules/admin/components/admin-chats-table";
import { AdminFeedbackTable } from "@/modules/admin/components/admin-feedback-table";
import { AdminKnowledgeNotesTable } from "@/modules/admin/components/admin-knowledge-notes-table";
import { AdminOverview } from "@/modules/admin/components/admin-overview";
import { AdminUserDetailSheet } from "@/modules/admin/components/admin-user-detail-sheet";
import { AdminUsersTable } from "@/modules/admin/components/admin-users-table";

export default function AdminPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
            Site analytics, users, logins and activity, chats, knowledge notes,
            and feedback.
          </p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview" className="gap-2 px-2">
            <BarChart3 className="h-4 w-4 shrink-0" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 px-2">
            <Users className="h-4 w-4 shrink-0" />
            Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 px-2">
            <Activity className="h-4 w-4 shrink-0" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="chats" className="gap-2 px-2">
            <MessageSquare className="h-4 w-4 shrink-0" />
            Chats
          </TabsTrigger>
          <TabsTrigger value="knowledge-notes" className="gap-2 px-2">
            <BookOpen className="h-4 w-4 shrink-0" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2 px-2">
            <MessagesSquare className="h-4 w-4 shrink-0" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-2">
          <AdminOverview />
        </TabsContent>
        <TabsContent value="users" className="pt-2">
          <AdminUsersTable onSelectUser={setSelectedUserId} />
        </TabsContent>
        <TabsContent value="activity" className="pt-2">
          <AdminActivityLog onSelectUser={setSelectedUserId} />
        </TabsContent>
        <TabsContent value="chats" className="pt-2">
          <AdminChatsTable onSelectUser={setSelectedUserId} />
        </TabsContent>
        <TabsContent value="knowledge-notes" className="pt-2">
          <AdminKnowledgeNotesTable />
        </TabsContent>
        <TabsContent value="feedback" className="pt-2">
          <AdminFeedbackTable />
        </TabsContent>
      </Tabs>

      <AdminUserDetailSheet
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
