"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { PageEditor } from "@/core/components/cms/page-editor";
import { PageList } from "@/core/components/cms/page-list";
import { NavbarManager } from "@/core/components/cms/navbar-manager";
import { CMSPage } from "@/modules/cms/apollo/types";
import { ArrowLeft } from "lucide-react";

export default function CMSDashboard() {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const router = useRouter();

  const handleEditPage = (page: CMSPage) => {
    setEditingPageId(page._id);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">CMS Dashboard</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Manage your website content, pages, and navigation
          </p>
        </div>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="navbar">Navbar</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Management</CardTitle>
                <CardDescription>
                  Create and manage static pages like About Us, Privacy Policy, Terms, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PageEditor
                  pageId={editingPageId || undefined}
                  onSaved={() => setEditingPageId(null)}
                />
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Existing Pages</h3>
                  <PageList onEdit={handleEditPage} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navbar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Navbar Management</CardTitle>
                <CardDescription>
                  Manage navigation links and their order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NavbarManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
