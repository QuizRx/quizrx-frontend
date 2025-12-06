"use client";

import Navbar from "@/core/components/shared/nav/nav-bar";
import Footer from "@/modules/landing/layouts/common/footer";
import { useAuth } from "@/core/providers/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while loading or if authenticated
  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex flex-col">
      <Navbar />
      <div>{children}</div>
      <Footer />
    </div>
  );
}
