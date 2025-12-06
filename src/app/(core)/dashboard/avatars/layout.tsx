import { Background } from "@/core/components/ui/background";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/core/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <SidebarProvider>
        <SidebarInset className="flex-1 min-h-screen">
          <div className="relative flex-1 overflow-clip">
            <Background
              className="absolute inset-0 z-0 bg-no-repeat bg-cover   bg-center pointer-events-none"
              image="/background/bg.svg"
            />
            <ScrollArea className="relative z-10 p-2 h-[90vh] overflow-hidden w-full backdrop-blur-lg bg-white/60">
              {children}
            </ScrollArea>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
