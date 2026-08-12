import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default global site metadata
export const metadata: Metadata = {
  title: {
    default: "Blogs ",
    template: "%s ",
  },
  description:
    "Explore the latest insights, tutorials, and news on web development, SaaS, and app architecture.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Blog",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body
        className={`${geistSans.className} min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-blue-500 selection:text-white`}
      >
        {/* Main Content Area */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
