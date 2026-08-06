"use client";

import Navbar from "@/core/components/shared/nav/nav-bar";
import Footer from "@/modules/landing/layouts/common/footer";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: we deliberately do NOT redirect authenticated users at the layout
  // level. Logged-in users need to be able to visit /about-us, /feedback,
  // /privacy-policy, etc. Only the root "/" page itself redirects
  // authenticated users to /chat.
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
