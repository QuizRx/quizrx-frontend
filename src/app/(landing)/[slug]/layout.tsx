"use client";

import Navbar from "@/core/components/shared/nav/nav-bar";
import Footer from "@/modules/landing/layouts/common/footer";

export default function DynamicPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
