"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import AvatarGrid from "@/modules/avatars/layouts/avatar/grid";
import { avatars } from "@/modules/avatars/utils/objects/avatars";

export default function Page() {
  // Filter avatars for each specialty

  return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl  mb-2">Hi, I'm Diana</h1>
        <p className="text-zinc-400 mb-6">Study with Diana in an immersive digital avatar experience</p>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8 border-b w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger variant={"underlined"} value="all">
              All
            </TabsTrigger>
            <TabsTrigger variant={"underlined"} value="endocrinology">
              Endocrinology
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <AvatarGrid avatars={avatars} />
          </TabsContent>

          <TabsContent value="endocrinology" className="mt-0">
            <AvatarGrid avatars={avatars} />
          </TabsContent>
        </Tabs>
      </div>
  );
}
