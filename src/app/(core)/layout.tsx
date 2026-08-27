"use client";

import { Background } from "@/core/components/ui/background";
import { useAuth } from "@/core/providers/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex-1">
      <Background
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center pointer-events-none"
        image="/background/bg.svg"
      />
      <div className="bg-transparent">{children}</div>
    </div>
  );
}
