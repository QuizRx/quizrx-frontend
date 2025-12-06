import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const poppinsFont = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizRx",
  description:
    "QuizRx is a health related examination platform design to provide knowledge about different health related topics with multiple resources.",
  keywords:
    "Question Bank, Health Topics, Examination Platform, Education, Medicine",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppinsFont.className} h-full relative w-full items-center`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
